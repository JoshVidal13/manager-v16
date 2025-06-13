"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Zap, ZapOff } from "lucide-react"

export function RealtimeStatus() {
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    console.log("🔔 Configurando monitor de realtime...")

    const subscription = supabase
      .channel("realtime_monitor")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "entries",
        },
        (payload) => {
          console.log("⚡ Evento realtime recibido:", payload)
          setLastUpdate(new Date())
        },
      )
      .subscribe((status) => {
        console.log("📡 Estado del monitor realtime:", status)
        setIsRealtimeConnected(status === "SUBSCRIBED")
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isRealtimeConnected ? "default" : "secondary"}
        className={`flex items-center gap-1 ${
          isRealtimeConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {isRealtimeConnected ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
        {isRealtimeConnected ? "Tiempo Real" : "Sin Tiempo Real"}
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-gray-500">Última actualización: {lastUpdate.toLocaleTimeString()}</span>
      )}
    </div>
  )
}
