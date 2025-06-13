-- Crear tabla de entradas
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('gasto', 'ingreso')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category);

-- Habilitar Row Level Security (RLS)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (para simplicidad)
-- En producción, deberías usar autenticación y políticas más restrictivas
CREATE POLICY IF NOT EXISTS "Allow all operations on entries" ON entries
  FOR ALL USING (true) WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_entries_updated_at ON entries;
CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
