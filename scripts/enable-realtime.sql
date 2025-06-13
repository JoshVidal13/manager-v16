-- Habilitar realtime para la tabla entries
ALTER PUBLICATION supabase_realtime ADD TABLE entries;

-- Verificar que realtime esté habilitado
SELECT schemaname, tablename, hasinserts, hasupdates, hasdeletes 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
