-- Verificar las fechas actuales en la tabla
SELECT id, date, created_at, 
       date::text as date_string,
       EXTRACT(DOW FROM date) as day_of_week,
       TO_CHAR(date, 'Day DD Mon YYYY') as formatted_date
FROM entries 
ORDER BY date DESC 
LIMIT 10;

-- Si hay fechas con problemas de zona horaria, este script las corrige
-- (Solo ejecutar si es necesario después de verificar los datos)

-- UPDATE entries 
-- SET date = DATE(date AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')
-- WHERE date != DATE(date AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City');

-- Verificar que no hay duplicados por problemas de fecha
SELECT date, COUNT(*) as count
FROM entries 
GROUP BY date 
HAVING COUNT(*) > 5  -- Ajustar según sea necesario
ORDER BY date DESC;
