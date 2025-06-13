import { createClient } from "@supabase/supabase-js"

// Obtener las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bgkevryolodnsxofnunu.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJna2V2cnlvbG9kbnN4b2ZudW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNjE2NzgsImV4cCI6MjA2NDczNzY3OH0.bJINAptkKqgly1PBgTQX3Q5-7RFpEnfLpgdB1b3E8Zk"

// Verificar si las variables están definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase URL o Anon Key no están configuradas. Verifica tu archivo .env.local")
}

// Crear el cliente de Supabase con configuración optimizada para realtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export interface Entry {
  id?: string
  type: "gasto" | "ingreso" | "inversion"
  category: string
  amount: number
  date: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Funciones para manejar las entradas
export const entriesService = {
  // Obtener todas las entradas
  async getAll(): Promise<Entry[]> {
    try {
      console.log("📡 Consultando base de datos...")
      const { data, error } = await supabase.from("entries").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error en consulta SQL:", error)
        throw error
      }

      console.log("📊 Datos recibidos de la base de datos:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("❌ Error in getAll:", error)
      throw error
    }
  },

  // Crear nueva entrada
  async create(entry: Omit<Entry, "id" | "created_at" | "updated_at">): Promise<Entry | null> {
    try {
      console.log("💾 Insertando en base de datos:", entry)
      const { data, error } = await supabase.from("entries").insert([entry]).select().single()

      if (error) {
        console.error("❌ Error en inserción SQL:", error)
        throw error
      }

      console.log("✅ Entrada insertada exitosamente:", data)
      return data
    } catch (error) {
      console.error("❌ Error in create:", error)
      throw error
    }
  },

  // Eliminar entrada
  async delete(id: string): Promise<boolean> {
    try {
      console.log("🗑️ Eliminando de base de datos:", id)
      const { error } = await supabase.from("entries").delete().eq("id", id)

      if (error) {
        console.error("❌ Error en eliminación SQL:", error)
        throw error
      }

      console.log("✅ Entrada eliminada exitosamente")
      return true
    } catch (error) {
      console.error("❌ Error in delete:", error)
      throw error
    }
  },

  // Actualizar entrada existente
  async update(id: string, entry: Partial<Omit<Entry, "id" | "created_at" | "updated_at">>): Promise<Entry | null> {
    try {
      console.log("✏️ Actualizando en base de datos:", id, entry)
      const { data, error } = await supabase.from("entries").update(entry).eq("id", id).select().single()

      if (error) {
        console.error("❌ Error en actualización SQL:", error)
        throw error
      }

      console.log("✅ Entrada actualizada exitosamente:", data)
      return data
    } catch (error) {
      console.error("❌ Error in update:", error)
      throw error
    }
  },

  // Suscribirse a cambios en tiempo real
  subscribeToChanges(callback: () => void) {
    try {
      console.log("🔔 Configurando canal de tiempo real...")

      const subscription = supabase
        .channel("entries_realtime")
        .on(
          "postgres_changes",
          {
            event: "*", // Escuchar INSERT, UPDATE, DELETE
            schema: "public",
            table: "entries",
          },
          (payload) => {
            console.log("🔄 Cambio detectado en tiempo real:", payload.eventType, payload)
            // Llamar al callback para actualizar los datos
            callback()
          },
        )
        .subscribe((status) => {
          console.log("📡 Estado de suscripción realtime:", status)
          if (status === "SUBSCRIBED") {
            console.log("✅ Suscripción realtime activa")
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ Error en canal realtime")
          } else if (status === "TIMED_OUT") {
            console.error("⏰ Timeout en suscripción realtime")
          }
        })

      return subscription
    } catch (error) {
      console.error("❌ Error setting up subscription:", error)
      return null
    }
  },
}
