-- Actualizar la tabla entries para incluir el tipo 'inversion'
ALTER TABLE entries 
DROP CONSTRAINT IF EXISTS entries_type_check;

ALTER TABLE entries 
ADD CONSTRAINT entries_type_check 
CHECK (type IN ('gasto', 'ingreso', 'inversion'));

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'entries' 
ORDER BY ordinal_position;

-- Verificar los tipos permitidos
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'entries_type_check';
