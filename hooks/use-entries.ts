"use client"

import { useState, useEffect, useCallback } from "react"
import { entriesService, type Entry } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar entradas iniciales
  const loadEntries = useCallback(async () => {
    try {
      console.log("🔄 Cargando entradas...")
      setLoading(true)
      setError(null)
      const data = await entriesService.getAll()
      console.log("✅ Entradas cargadas:", data.length, data)
      setEntries(data)
    } catch (err) {
      console.error("❌ Error loading entries:", err)
      setError("Error al cargar las entradas")
    } finally {
      setLoading(false)
    }
  }, [])

  // Agregar nueva entrada
  const addEntry = useCallback(async (entryData: Omit<Entry, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("➕ Agregando entrada:", entryData)
      setError(null)
      const newEntry = await entriesService.create(entryData)
      if (newEntry) {
        console.log("✅ Entrada creada:", newEntry)
        // Actualizar inmediatamente el estado local
        setEntries((prev) => [newEntry, ...prev])
        return newEntry
      } else {
        console.error("❌ Error: No se pudo crear la entrada")
        setError("Error al crear la entrada")
        return null
      }
    } catch (err) {
      console.error("❌ Error adding entry:", err)
      setError("Error al agregar la entrada")
      return null
    }
  }, [])

  // Eliminar entrada
  const deleteEntry = useCallback(async (id: string) => {
    try {
      console.log("🗑️ Eliminando entrada:", id)
      setError(null)
      const success = await entriesService.delete(id)
      if (success) {
        console.log("✅ Entrada eliminada")
        // Actualizar inmediatamente el estado local
        setEntries((prev) => prev.filter((entry) => entry.id !== id))
        return true
      } else {
        console.error("❌ Error: No se pudo eliminar la entrada")
        setError("Error al eliminar la entrada")
        return false
      }
    } catch (err) {
      console.error("❌ Error deleting entry:", err)
      setError("Error al eliminar la entrada")
      return false
    }
  }, [])

  // Actualizar entrada
  const updateEntry = useCallback(
    async (id: string, entryData: Partial<Omit<Entry, "id" | "created_at" | "updated_at">>) => {
      try {
        console.log("✏️ Actualizando entrada:", id, entryData)
        setError(null)
        const updatedEntry = await entriesService.update(id, entryData)
        if (updatedEntry) {
          console.log("✅ Entrada actualizada:", updatedEntry)
          // Actualizar inmediatamente el estado local
          setEntries((prev) => prev.map((entry) => (entry.id === id ? updatedEntry : entry)))
          return updatedEntry
        } else {
          console.error("❌ Error: No se pudo actualizar la entrada")
          setError("Error al actualizar la entrada")
          return null
        }
      } catch (err) {
        console.error("❌ Error updating entry:", err)
        setError("Error al actualizar la entrada")
        return null
      }
    },
    [],
  )

  // Configurar suscripción en tiempo real
  useEffect(() => {
    let subscription: RealtimeChannel | null = null

    const setupRealtimeSubscription = () => {
      console.log("🔔 Configurando suscripción en tiempo real...")
      subscription = entriesService.subscribeToChanges(async () => {
        console.log("🔄 Cambio detectado, recargando datos...")
        // Recargar datos cuando hay cambios de otros dispositivos
        const updatedEntries = await entriesService.getAll()
        console.log("📊 Datos actualizados:", updatedEntries.length)
        setEntries(updatedEntries)
      })
    }

    // Cargar datos iniciales
    loadEntries().then(() => {
      // Configurar suscripción después de cargar datos iniciales
      setupRealtimeSubscription()
    })

    // Cleanup
    return () => {
      if (subscription) {
        console.log("🔌 Desconectando suscripción...")
        subscription.unsubscribe()
      }
    }
  }, [loadEntries])

  return {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    updateEntry,
    refetch: loadEntries,
  }
}
