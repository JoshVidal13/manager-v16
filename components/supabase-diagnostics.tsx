"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function SupabaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState({
    urlConfigured: false,
    keyConfigured: false,
    connectionTest: "pending" as "pending" | "success" | "error",
    tableExists: "pending" as "pending" | "success" | "error",
    insertTest: "pending" as "pending" | "success" | "error",
    readTest: "pending" as "pending" | "success" | "error",
    dataCount: 0,
    errorMessage: "",
  })

  const runDiagnostics = async () => {
    // Reset diagnostics
    setDiagnostics({
      urlConfigured: false,
      keyConfigured: false,
      connectionTest: "pending",
      tableExists: "pending",
      insertTest: "pending",
      readTest: "pending",
      dataCount: 0,
      errorMessage: "",
    })

    try {
      // Check if URL and key are configured
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      setDiagnostics((prev) => ({
        ...prev,
        urlConfigured: !!url && url.includes("supabase.co"),
        keyConfigured: !!key && key.length > 20,
      }))

      // Test connection
      try {
        const { data, error } = await supabase.from("entries").select("count")
        if (error) throw error
        setDiagnostics((prev) => ({ ...prev, connectionTest: "success" }))
      } catch (error) {
        console.error("Connection test failed:", error)
        setDiagnostics((prev) => ({
          ...prev,
          connectionTest: "error",
          errorMessage: `Error de conexión: ${error instanceof Error ? error.message : String(error)}`,
        }))
        return // Stop diagnostics if connection fails
      }

      // Check if table exists
      try {
        const { data, error } = await supabase.from("entries").select("id").limit(1)
        if (error && error.code === "42P01") {
          // Table doesn't exist error
          throw new Error("La tabla 'entries' no existe")
        }
        setDiagnostics((prev) => ({ ...prev, tableExists: "success" }))
      } catch (error) {
        console.error("Table check failed:", error)
        setDiagnostics((prev) => ({
          ...prev,
          tableExists: "error",
          errorMessage: `Error en tabla: ${error instanceof Error ? error.message : String(error)}`,
        }))
        return
      }

      // Test insert
      try {
        const testEntry = {
          type: "gasto",
          category: "Test",
          amount: 1,
          date: new Date().toISOString().split("T")[0],
          description: "Test de diagnóstico - Ignorar",
        }

        const { data, error } = await supabase.from("entries").insert([testEntry]).select()
        if (error) throw error

        // Delete the test entry
        if (data && data[0] && data[0].id) {
          await supabase.from("entries").delete().eq("id", data[0].id)
        }

        setDiagnostics((prev) => ({ ...prev, insertTest: "success" }))
      } catch (error) {
        console.error("Insert test failed:", error)
        setDiagnostics((prev) => ({
          ...prev,
          insertTest: "error",
          errorMessage: `Error al insertar: ${error instanceof Error ? error.message : String(error)}`,
        }))
      }

      // Test read data
      try {
        const { data, error } = await supabase.from("entries").select("*").limit(5)
        if (error) throw error

        console.log("Datos leídos en diagnóstico:", data)
        setDiagnostics((prev) => ({
          ...prev,
          readTest: "success",
          dataCount: data?.length || 0,
        }))
      } catch (error) {
        console.error("Read test failed:", error)
        setDiagnostics((prev) => ({
          ...prev,
          readTest: "error",
          errorMessage: `Error al leer datos: ${error instanceof Error ? error.message : String(error)}`,
        }))
      }
    } catch (error) {
      console.error("Diagnostics failed:", error)
      setDiagnostics((prev) => ({
        ...prev,
        errorMessage: `Error general: ${error instanceof Error ? error.message : String(error)}`,
      }))
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const StatusBadge = ({ status }: { status: "pending" | "success" | "error" }) => {
    if (status === "pending") return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
    if (status === "success") return <Badge className="bg-green-100 text-green-800">Correcto</Badge>
    return <Badge className="bg-red-100 text-red-800">Error</Badge>
  }

  const StatusIcon = ({ status }: { status: "pending" | "success" | "error" | boolean }) => {
    if (status === "pending") return <AlertCircle className="w-5 h-5 text-yellow-500" />
    if (status === "success" || status === true) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Diagnóstico de Supabase
          <Button size="sm" onClick={runDiagnostics}>
            Ejecutar diagnóstico
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">URL de Supabase configurada</span>
            <StatusIcon status={diagnostics.urlConfigured} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Clave anónima configurada</span>
            <StatusIcon status={diagnostics.keyConfigured} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Prueba de conexión</span>
            <StatusIcon status={diagnostics.connectionTest} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Tabla 'entries' existe</span>
            <StatusIcon status={diagnostics.tableExists} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Prueba de inserción</span>
            <StatusIcon status={diagnostics.insertTest} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Prueba de lectura de datos ({diagnostics.dataCount} registros)</span>
            <StatusIcon status={diagnostics.readTest} />
          </div>
        </div>

        {diagnostics.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            <strong>Error detectado:</strong> {diagnostics.errorMessage}
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
          <strong>Sugerencias:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Verifica que hayas creado el archivo .env.local con las variables correctas</li>
            <li>Asegúrate de haber ejecutado el script SQL para crear la tabla</li>
            <li>Verifica que las políticas de RLS estén configuradas correctamente</li>
            <li>Reinicia el servidor de desarrollo después de configurar las variables de entorno</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
