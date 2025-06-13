"use client"

import { SupabaseDiagnostics } from "@/components/supabase-diagnostics"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Diagnóstico de Conexión</h1>
        </div>

        <SupabaseDiagnostics />

        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold">Solución de problemas comunes</h2>

          <div className="space-y-2">
            <h3 className="font-semibold">1. Problema: Variables de entorno incorrectas</h3>
            <p>
              Crea un archivo <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> en la raíz del
              proyecto con:
            </p>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
              NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co{"\n"}
              NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key
            </pre>
            <p>Luego reinicia el servidor de desarrollo.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Problema: Tabla no creada</h3>
            <p>Ejecuta el siguiente SQL en el SQL Editor de Supabase:</p>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
              {`CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('gasto', 'ingreso')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones
CREATE POLICY "Allow all operations on entries" ON entries
  FOR ALL USING (true) WITH CHECK (true);`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Problema: Políticas de seguridad (RLS)</h3>
            <p>Verifica que las políticas de Row Level Security estén configuradas correctamente:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Ve a Authentication &gt; Policies en Supabase</li>
              <li>Selecciona la tabla "entries"</li>
              <li>Asegúrate de que exista una política que permita operaciones sin autenticación</li>
              <li>
                Si no existe, crea una nueva política con "For all operations" y "Using expression" y "With check
                expression" ambos configurados como "true"
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
