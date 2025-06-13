"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit } from "lucide-react"
import type { Entry } from "@/lib/supabase"
import { formatDateForStorage } from "@/lib/date-utils"

const CATEGORIES = {
  gasto: ["Carne", "Agua", "Gas", "Salarios", "Insumos", "Transporte", "Servicios", "Refresco", "Otros", "Cambio"],
  ingreso: ["Efectivo", "Transferencia", "Ventas", "Servicios", "Otros", "Cambio"],
  inversion: ["Acciones", "Bonos", "Criptomonedas", "Bienes Raíces", "Negocio", "Otros"],
}

interface EditEntryDialogProps {
  entry: Entry
  onUpdate: (id: string, data: Partial<Omit<Entry, "id" | "created_at" | "updated_at">>) => Promise<Entry | null>
}

export function EditEntryDialog({ entry, onUpdate }: EditEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    type: entry.type,
    category: entry.category,
    amount: entry.amount.toString(),
    date: entry.date,
    description: entry.description || "",
  })

  const handleUpdate = async () => {
    if (!formData.category || !formData.amount || isUpdating) return

    setIsUpdating(true)
    try {
      const updateData = {
        type: formData.type,
        category: formData.category,
        amount: Number.parseFloat(formData.amount),
        date: formatDateForStorage(formData.date),
        description: formData.description || undefined,
      }

      const result = await onUpdate(entry.id!, updateData)
      if (result) {
        setOpen(false)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">✏️ Editar Entrada</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Modifica los datos de la entrada seleccionada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-type" className="text-right dark:text-gray-200">
              Tipo
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: "gasto" | "ingreso" | "inversion") =>
                setFormData({ ...formData, type: value, category: "" })
              }
              disabled={isUpdating}
            >
              <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="gasto">💸 Gasto</SelectItem>
                <SelectItem value="ingreso">💰 Ingreso</SelectItem>
                <SelectItem value="inversion">📈 Inversión</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-category" className="text-right dark:text-gray-200">
              Categoría
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={isUpdating}
            >
              <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                {CATEGORIES[formData.type].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-amount" className="text-right dark:text-gray-200">
              Monto
            </Label>
            <Input
              id="edit-amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              disabled={isUpdating}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-date" className="text-right dark:text-gray-200">
              Fecha
            </Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              disabled={isUpdating}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right dark:text-gray-200">
              Descripción
            </Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="Opcional"
              disabled={isUpdating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUpdating}
            className="dark:border-gray-600 dark:text-gray-200"
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Actualizando..." : "💾 Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
