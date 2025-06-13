"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar conexión a internet
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Verificar conexión a Supabase
    const checkSupabaseConnection = async () => {
      setIsChecking(true)
      try {
        const { data, error } = await supabase.from("entries").select("count").limit(1)

        if (error) {
          console.error("Error connecting to Supabase:", error)
          setError(error.message)
          setIsConnected(false)
        } else {
          setError(null)
          setIsConnected(true)
        }
      } catch (err) {
        console.error("Exception checking Supabase connection:", err)
        setIsConnected(false)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsChecking(false)
      }
    }

    checkSupabaseConnection()
    const interval = setInterval(checkSupabaseConnection, 30000) // Verificar cada 30 segundos

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  const getStatusInfo = () => {
    if (isChecking) {
      return {
        icon: RefreshCw,
        text: "Verificando...",
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      }
    }

    if (!isOnline) {
      return {
        icon: WifiOff,
        text: "Sin conexión",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 border-red-200",
      }
    }

    if (!isConnected) {
      return {
        icon: AlertCircle,
        text: error ? "Error" : "Reconectando...",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 border-red-200",
        tooltip: error,
      }
    }

    return {
      icon: Wifi,
      text: "Conectado",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    }
  }

  const status = getStatusInfo()
  const Icon = status.icon

  return (
    <Link href="/diagnostico" className="no-underline">
      <Badge
        variant={status.variant}
        className={`${status.className} flex items-center gap-1 cursor-pointer`}
        title={status.tooltip}
      >
        <Icon className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
        {status.text}
      </Badge>
    </Link>
  )
}
