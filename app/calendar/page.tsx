"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowLeft, CalendarIcon, BarChart3 } from "lucide-react"
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useEntries } from "@/hooks/use-entries"
import { ConnectionStatus } from "@/components/connection-status"
import { createLocalDate, formatDateForStorage } from "@/lib/date-utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { FinanceChart } from "@/components/finance-chart"

export default function CalendarPage() {
  const { entries, loading } = useEntries()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const dailyTotals = useMemo(() => {
    const totalsByDate: { [date: string]: { ingresos: number; gastos: number; inversiones: number; entries: any[] } } =
      {}

    entries.forEach((entry) => {
      const dateStr = formatDateForStorage(entry.date)
      if (!totalsByDate[dateStr]) {
        totalsByDate[dateStr] = { ingresos: 0, gastos: 0, inversiones: 0, entries: [] }
      }
      totalsByDate[dateStr].entries.push(entry)
      if (entry.type === "ingreso") {
        totalsByDate[dateStr].ingresos += entry.amount
      } else if (entry.type === "gasto") {
        totalsByDate[dateStr].gastos += entry.amount
      } else if (entry.type === "inversion") {
        totalsByDate[dateStr].inversiones += entry.amount
      }
    })

    return totalsByDate
  }, [entries])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    // CAMBIADO: Ahora las semanas empiezan en jueves (4)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 4 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 4 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  const selectedDayEntries = useMemo(() => {
    if (!selectedDay) return []
    const dateStr = formatDateForStorage(selectedDay)
    return dailyTotals[dateStr]?.entries || []
  }, [selectedDay, dailyTotals])

  const monthlyTotals = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    let ingresos = 0
    let gastos = 0
    let inversiones = 0

    Object.entries(dailyTotals).forEach(([dateStr, totals]) => {
      const date = createLocalDate(dateStr)
      if (date >= monthStart && date <= monthEnd) {
        ingresos += totals.ingresos
        gastos += totals.gastos
        inversiones += totals.inversiones
      }
    })

    // El balance ahora es ingresos menos inversiones
    return { ingresos, gastos, inversiones, balance: ingresos - inversiones }
  }, [currentDate, dailyTotals])

  // Datos para gráficos mensuales
  const chartData = useMemo(() => {
    // Obtener todos los días del mes actual
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    })

    // Crear datos para el gráfico diario
    const dailyData = daysInMonth.map((day) => {
      const dateStr = formatDateForStorage(day)
      const dayData = dailyTotals[dateStr] || { ingresos: 0, gastos: 0, inversiones: 0 }

      return {
        name: format(day, "dd"),
        ingresos: dayData.ingresos,
        gastos: dayData.gastos,
        inversiones: dayData.inversiones,
        balance: dayData.ingresos - dayData.inversiones,
      }
    })

    return {
      dailyData,
    }
  }, [currentDate, dailyTotals])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
    setSelectedDay(null)
  }

  const getDayColor = (day: Date) => {
    const dateStr = formatDateForStorage(day)
    const dayData = dailyTotals[dateStr]

    if (!dayData) return "bg-white dark:bg-gray-800"

    // El balance es ingresos menos inversiones
    const balance = dayData.ingresos - dayData.inversiones
    if (balance > 0) return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
    if (dayData.inversiones > 0) return "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
    if (dayData.gastos > 0) return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
    return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md dark:bg-gray-800/50 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-gray-800 dark:text-gray-100">Cargando calendario...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">📅 Calendario Financiero</h1>
            <ConnectionStatus />
          </div>
          <ThemeToggle />
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Mes Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {format(currentDate, "MMMM yyyy", { locale: es })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                💰 Ingresos del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                ${monthlyTotals.ingresos.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">💸 Gastos del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-red-700 dark:text-red-400">
                ${monthlyTotals.gastos.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">📈 Inversiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                ${monthlyTotals.inversiones.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de tendencia mensual */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <BarChart3 className="w-5 h-5" />📊 Tendencia Mensual - {format(currentDate, "MMMM yyyy", { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <FinanceChart
                type="bar"
                data={chartData.dailyData}
                keys={["ingresos", "gastos", "inversiones"]}
                colors={["#22c55e", "#ef4444", "#8b5cf6"]}
                indexBy="name"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-800/50 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800 dark:text-gray-100">
                    {format(currentDate, "MMMM yyyy", { locale: es })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {/* CAMBIADO: Ahora los días de la semana empiezan en jueves */}
                  {["Jue", "Vie", "Sáb", "Dom", "Lun", "Mar", "Mié"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const dateStr = formatDateForStorage(day)
                    const dayData = dailyTotals[dateStr]
                    const isCurrentMonth = isSameMonth(day, currentDate)
                    const isSelected = selectedDay && isSameDay(day, selectedDay)

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(day)}
                        className={`
                          p-2 min-h-[80px] border rounded-lg text-left transition-all hover:shadow-md
                          ${getDayColor(day)}
                          ${!isCurrentMonth ? "opacity-40" : ""}
                          ${isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}
                        `}
                      >
                        <div className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">
                          {format(day, "d")}
                        </div>
                        {dayData && (
                          <div className="space-y-1">
                            {dayData.ingresos > 0 && (
                              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                💰 +${dayData.ingresos.toLocaleString()}
                              </div>
                            )}
                            {dayData.gastos > 0 && (
                              <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                                💸 -${dayData.gastos.toLocaleString()}
                              </div>
                            )}
                            {dayData.inversiones > 0 && (
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                📈 -${dayData.inversiones.toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Day Details */}
          <div>
            <Card className="dark:bg-gray-800/50 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-100">
                  {selectedDay
                    ? `📅 ${format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}`
                    : "📅 Selecciona un día"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDay ? (
                  <div className="space-y-4">
                    {selectedDayEntries.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay movimientos este día</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {selectedDayEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600"
                            >
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    entry.type === "ingreso"
                                      ? "default"
                                      : entry.type === "gasto"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className={
                                    entry.type === "inversion"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                                      : ""
                                  }
                                >
                                  {entry.type === "ingreso" ? "💰" : entry.type === "gasto" ? "💸" : "📈"}
                                </Badge>
                                <div>
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    {entry.category}
                                  </p>
                                  {entry.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{entry.description}</p>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`text-sm font-bold ${entry.type === "ingreso" ? "text-green-600 dark:text-green-400" : entry.type === "gasto" ? "text-red-600 dark:text-red-400" : "text-purple-600 dark:text-purple-400"}`}
                              >
                                ${entry.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-3 dark:border-gray-600">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                              <div className="font-bold text-green-600 dark:text-green-400">
                                ${(dailyTotals[format(selectedDay, "yyyy-MM-dd")]?.ingresos || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">💰 Ingresos</div>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                              <div className="font-bold text-red-600 dark:text-red-400">
                                ${(dailyTotals[format(selectedDay, "yyyy-MM-dd")]?.gastos || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">💸 Gastos</div>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                              <div className="font-bold text-purple-600 dark:text-purple-400">
                                ${(dailyTotals[format(selectedDay, "yyyy-MM-dd")]?.inversiones || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">📈 Inversiones</div>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <div className="font-bold text-blue-600 dark:text-blue-400">
                                $
                                {(
                                  (dailyTotals[format(selectedDay, "yyyy-MM-dd")]?.ingresos || 0) -
                                  (dailyTotals[format(selectedDay, "yyyy-MM-dd")]?.inversiones || 0)
                                ).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">💎 Balance</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Haz clic en cualquier día del calendario para ver sus detalles
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Leyenda del calendario */}
            <Card className="mt-4 dark:bg-gray-800/50 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-gray-800 dark:text-gray-100">🎨 Leyenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Balance positivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Día con inversiones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Solo gastos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Balance negativo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
