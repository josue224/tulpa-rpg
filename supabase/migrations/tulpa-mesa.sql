-- =====================================================================
-- TULPA RPG · Visão de Mesa nova (mapa, tokens, música, documentos, call)
-- Rode UMA vez no SQL Editor do Supabase. Só CRIA coisas novas:
-- não apaga nem altera nenhuma tabela que já existe.
-- Sem este arquivo o site continua funcionando pela reserva
-- (campaign_items + ficha), mas com menos privacidade nas imagens
-- particulares e sem a conferência do banco ao mover tokens.
-- =====================================================================

-- 1) Registros leves da mesa: estado (mapa ativo, tokens, câmera, música,
--    intervalo, call, playlist), lista de mapas e de documentos, notas do Mestre.
create table if not exists public.campaign_store (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  key         text not null,
  kind        text not null default 'state',
  value       jsonb not null default '{}'::jsonb,
  audience    uuid[],                       -- null = todos da campanha; senão, só estes usuários (e o Mestre)
  created_by  uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (campaign_id, key)
);
create index if not exists campaign_store_kind_idx on public.campaign_store (campaign_id, kind);

-- 2) Arquivos pesados (imagem do mapa e dos documentos). Fica FORA do tempo real
--    para não empurrar a imagem inteira para todo mundo a cada mudança.
create table if not exists public.campaign_blobs (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  key         text not null,
  data        text not null,
  audience    uuid[],
  created_by  uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  primary key (campaign_id, key)
);

alter table public.campaign_store enable row level security;
alter table public.campaign_blobs enable row level security;

-- Ler: o Mestre vê tudo; o jogador vê o que é de todos ou o que foi enviado para ele.
drop policy if exists campaign_store_select on public.campaign_store;
create policy campaign_store_select on public.campaign_store for select using (
  public.is_campaign_master(campaign_id)
  or (public.is_campaign_member(campaign_id) and (audience is null or (select auth.uid()) = any(audience)))
);
-- Criar e alterar: só o Mestre.
drop policy if exists campaign_store_insert on public.campaign_store;
create policy campaign_store_insert on public.campaign_store for insert
  with check (public.is_campaign_master(campaign_id) and created_by = (select auth.uid()));
drop policy if exists campaign_store_update on public.campaign_store;
create policy campaign_store_update on public.campaign_store for update
  using (public.is_campaign_master(campaign_id)) with check (public.is_campaign_master(campaign_id));
-- Apagar: o Mestre; ou o jogador, quando a imagem foi enviada só para ele.
drop policy if exists campaign_store_delete on public.campaign_store;
create policy campaign_store_delete on public.campaign_store for delete using (
  public.is_campaign_master(campaign_id)
  or (kind = 'doc' and audience = array[(select auth.uid())])
);

drop policy if exists campaign_blobs_select on public.campaign_blobs;
create policy campaign_blobs_select on public.campaign_blobs for select using (
  public.is_campaign_master(campaign_id)
  or (public.is_campaign_member(campaign_id) and (audience is null or (select auth.uid()) = any(audience)))
);
drop policy if exists campaign_blobs_insert on public.campaign_blobs;
create policy campaign_blobs_insert on public.campaign_blobs for insert
  with check (public.is_campaign_master(campaign_id) and created_by = (select auth.uid()));
drop policy if exists campaign_blobs_update on public.campaign_blobs;
create policy campaign_blobs_update on public.campaign_blobs for update
  using (public.is_campaign_master(campaign_id)) with check (public.is_campaign_master(campaign_id));
drop policy if exists campaign_blobs_delete on public.campaign_blobs;
create policy campaign_blobs_delete on public.campaign_blobs for delete using (
  public.is_campaign_master(campaign_id)
  or (key like 'doc:%' and audience = array[(select auth.uid())])
);

grant select, insert, update, delete on public.campaign_store to authenticated;
grant select, insert, update, delete on public.campaign_blobs to authenticated;

-- 3) Mover token: o jogador só move o token do PRÓPRIO personagem; o Mestre move qualquer um.
--    A conferência é feita aqui, no banco, e não no navegador.
create or replace function public.move_campaign_token(
  p_campaign_id uuid, p_token_id text, p_x numeric, p_y numeric
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_state  jsonb;
  v_tokens jsonb;
  v_idx    int;
  v_char   text;
  v_ok     boolean;
begin
  if not public.is_campaign_member(p_campaign_id) then
    raise exception 'Você não participa desta campanha.' using errcode = '42501';
  end if;
  select value into v_state from public.campaign_store
   where campaign_id = p_campaign_id and key = 'state' for update;
  if v_state is null then return false; end if;
  v_tokens := coalesce(v_state -> 'tokens', '[]'::jsonb);
  select (ord - 1)::int, tok ->> 'charId' into v_idx, v_char
    from jsonb_array_elements(v_tokens) with ordinality as t(tok, ord)
   where tok ->> 'id' = p_token_id limit 1;
  if v_idx is null then return false; end if;
  v_ok := public.is_campaign_master(p_campaign_id) or exists (
    select 1 from public.characters c
     where c.id::text = v_char and c.campaign_id = p_campaign_id and c.owner_id = auth.uid());
  if not v_ok then
    raise exception 'Você só pode mover o token do seu personagem.' using errcode = '42501';
  end if;
  v_tokens := jsonb_set(v_tokens, array[v_idx::text, 'x'], to_jsonb(greatest(0, least(400, round(p_x)))));
  v_tokens := jsonb_set(v_tokens, array[v_idx::text, 'y'], to_jsonb(greatest(0, least(400, round(p_y)))));
  v_state  := jsonb_set(v_state, '{tokens}', v_tokens);
  v_state  := jsonb_set(v_state, '{rev}', to_jsonb(coalesce((v_state ->> 'rev')::bigint, 0) + 1));
  update public.campaign_store set value = v_state, updated_at = now()
   where campaign_id = p_campaign_id and key = 'state';
  return true;
end $$;
revoke all on function public.move_campaign_token(uuid, text, numeric, numeric) from public, anon;
grant execute on function public.move_campaign_token(uuid, text, numeric, numeric) to authenticated;

-- 4) Tempo real só para os registros leves.
do $$ begin
  if not exists (select 1 from pg_publication_tables
                  where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'campaign_store') then
    alter publication supabase_realtime add table public.campaign_store;
  end if;
end $$;
