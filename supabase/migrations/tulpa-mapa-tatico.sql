-- =====================================================================
-- TULPA RPG · Motor tático do mapa (movimento com direção e portas)
-- Rode UMA vez no SQL Editor do Supabase, DEPOIS do tulpa-mesa.sql.
-- Só CRIA duas funções novas: não apaga nem altera tabela nenhuma.
-- Sem este arquivo o site continua funcionando: o aparelho do Mestre
-- confere e grava o movimento e as portas (precisa do Mestre na mesa).
-- =====================================================================

-- 1) Mover token com posição livre (frações de quadrado) e direção (ângulo).
--    O jogador só move o token do PRÓPRIO personagem; o Mestre move qualquer um.
create or replace function public.move_campaign_token_v2(
  p_campaign_id uuid, p_token_id text, p_x numeric, p_y numeric, p_a numeric default null
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_state  jsonb;
  v_tokens jsonb;
  v_idx    int;
  v_char   text;
  v_a      numeric;
begin
  if not public.is_campaign_member(p_campaign_id) then
    raise exception 'Você não participa desta campanha.' using errcode = '42501';
  end if;
  if p_x is null or p_y is null then return false; end if;
  select value into v_state from public.campaign_store
   where campaign_id = p_campaign_id and key = 'state' for update;
  if v_state is null then return false; end if;
  v_tokens := coalesce(v_state -> 'tokens', '[]'::jsonb);
  select (ord - 1)::int, tok ->> 'charId' into v_idx, v_char
    from jsonb_array_elements(v_tokens) with ordinality as t(tok, ord)
   where tok ->> 'id' = p_token_id limit 1;
  if v_idx is null then return false; end if;
  if not (public.is_campaign_master(p_campaign_id) or exists (
    select 1 from public.characters c
     where c.id::text = v_char and c.campaign_id = p_campaign_id and c.owner_id = auth.uid())) then
    raise exception 'Você só pode mover o token do seu personagem.' using errcode = '42501';
  end if;
  v_tokens := jsonb_set(v_tokens, array[v_idx::text, 'x'], to_jsonb(round(greatest(-1::numeric, least(400::numeric, p_x)), 3)));
  v_tokens := jsonb_set(v_tokens, array[v_idx::text, 'y'], to_jsonb(round(greatest(-1::numeric, least(400::numeric, p_y)), 3)));
  if p_a is not null then
    v_a := p_a - (2 * pi())::numeric * floor(p_a / (2 * pi())::numeric);
    v_tokens := jsonb_set(v_tokens, array[v_idx::text, 'a'], to_jsonb(round(v_a, 3)), true);
  end if;
  v_state := jsonb_set(v_state, '{tokens}', v_tokens);
  v_state := jsonb_set(v_state, '{rev}', to_jsonb(coalesce((v_state ->> 'rev')::bigint, 0) + 1));
  update public.campaign_store set value = v_state, updated_at = now()
   where campaign_id = p_campaign_id and key = 'state';
  return true;
end $$;
revoke all on function public.move_campaign_token_v2(uuid, text, numeric, numeric, numeric) from public, anon;
grant execute on function public.move_campaign_token_v2(uuid, text, numeric, numeric, numeric) to authenticated;

-- 2) Abrir ou fechar uma porta. Porta trancada: o jogador não abre (resposta 'locked');
--    o Mestre tranca e destranca pela própria mesa. Respostas: 'open', 'closed', 'locked', 'none'.
create or replace function public.use_campaign_door(
  p_campaign_id uuid, p_map_key text, p_wall_id text
) returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_state jsonb;
  v_walls jsonb;
  v_idx   int;
  v_door  jsonb;
  v_open  boolean;
begin
  if not public.is_campaign_member(p_campaign_id) then
    raise exception 'Você não participa desta campanha.' using errcode = '42501';
  end if;
  select value into v_state from public.campaign_store
   where campaign_id = p_campaign_id and key = 'state' for update;
  if v_state is null then return 'none'; end if;
  v_walls := v_state -> 'geo' -> p_map_key -> 'walls';
  if v_walls is null or jsonb_typeof(v_walls) <> 'array' then return 'none'; end if;
  select (ord - 1)::int, w -> 'door' into v_idx, v_door
    from jsonb_array_elements(v_walls) with ordinality as t(w, ord)
   where w ->> 'id' = p_wall_id limit 1;
  if v_idx is null or v_door is null or jsonb_typeof(v_door) <> 'object' then return 'none'; end if;
  if coalesce((v_door ->> 'locked')::boolean, false) and not public.is_campaign_master(p_campaign_id) then
    return 'locked';
  end if;
  v_open := not coalesce((v_door ->> 'open')::boolean, false);
  v_state := jsonb_set(v_state, array['geo', p_map_key, 'walls', v_idx::text, 'door', 'open'], to_jsonb(v_open));
  v_state := jsonb_set(v_state, '{rev}', to_jsonb(coalesce((v_state ->> 'rev')::bigint, 0) + 1));
  update public.campaign_store set value = v_state, updated_at = now()
   where campaign_id = p_campaign_id and key = 'state';
  return case when v_open then 'open' else 'closed' end;
end $$;
revoke all on function public.use_campaign_door(uuid, text, text) from public, anon;
grant execute on function public.use_campaign_door(uuid, text, text) to authenticated;
