-- =====================================================================
-- TULPA RPG · Onda 1 · Sincronização: garante o tempo real das tabelas da mesa
-- Rode UMA vez no SQL Editor do Supabase. Idempotente e não destrutivo:
-- só ADICIONA à publicação supabase_realtime as tabelas que existirem e ainda
-- não estiverem nela. Não altera tabelas, dados nem políticas (RLS).
-- Sem este arquivo o site continua funcionando (reconexão + conferência
-- periódica no navegador), mas as mudanças do Mestre podem demorar até ~25 s.
-- =====================================================================
do $$
declare
  t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    raise notice 'Publicação supabase_realtime não existe; nada a fazer.';
    return;
  end if;
  foreach t in array array[
    'campaign_store','campaign_items','campaign_rolls','campaign_runtime',
    'campaign_reflex_rolls','campaign_members','characters','character_sheets','campaigns'
  ] loop
    if to_regclass('public.' || t) is not null
       and not exists (select 1 from pg_publication_tables
                        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
      raise notice 'Adicionada ao tempo real: %', t;
    end if;
  end loop;
end $$;
