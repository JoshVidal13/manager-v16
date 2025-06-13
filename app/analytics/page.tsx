"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Calculator,
  Eye,
} from "lucide-react"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isWithinInterval,
  startOfYear,
  endOfYear,
  differenceInDays,
} from "date-fns"
import Link from "next/link"
import { useEntries } from "@/hooks/use-entries"
import { ConnectionStatus } from "@/components/connection-status"
import { createLocalDate } from "@/lib/date-utils"
import { FinanceChart } from "@/components/finance-chart"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AnalyticsPage() {
  const { entries, loading } = useEntries()
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth")
  const [currentDate, setCurrentDate] = useState(new Date())

  const filteredEntries = useMemo(() => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (selectedPeriod) {
      case "thisWeek":
        // CAMBIADO: Ahora las semanas empiezan en jueves (4)
        startDate = startOfWeek(now, { weekStartsOn: 4 })
        endDate = endOfWeek(now, { weekStartsOn: 4 })
        break
      case "thisMonth":
        startDate = startOfMonth(currentDate)
        endDate = endOfMonth(currentDate)
        break
      case "thisYear":
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      default:
        return entries
    }

    return entries.filter((entry) => {
      const entryDate = createLocalDate(entry.date)
      return isWithinInterval(entryDate, { start: startDate, end: endDate })
    })
  }, [entries, selectedPeriod, currentDate])

  const analytics = useMemo(() => {
    const gastos = filteredEntries.filter((e) => e.type === "gasto").reduce((sum, e) => sum + e.amount, 0)
    const ingresos = filteredEntries.filter((e) => e.type === "ingreso").reduce((sum, e) => sum + e.amount, 0)
    const inversiones = filteredEntries.filter((e) => e.type === "inversion").reduce((sum, e) => sum + e.amount, 0)
    const balance = ingresos - inversiones

    // Análisis por categorías
    const categoriasMasUsadas = {}
    filteredEntries.forEach((entry) => {
      const key = `${entry.type}-${entry.category}`
      categoriasMasUsadas[key] = (categoriasMasUsadas[key] || 0) + 1
    })

    // Análisis de tendencias
    // CAMBIADO: Ahora las semanas empiezan en jueves (4)
    const weeks = eachWeekOfInterval(
      {
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 4 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 4 }),
      },
      { weekStartsOn: 4 },
    )

    const tendenciaSemanal = weeks.map((weekStart) => {
      // CAMBIADO: Ahora las semanas empiezan en jueves (4)
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 4 })
      const weekEntries = filteredEntries.filter((entry) => {
        const entryDate = createLocalDate(entry.date)
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd })
      })

      const weekIngresos = weekEntries.filter((e) => e.type === "ingreso").reduce((sum, e) => sum + e.amount, 0)
      const weekGastos = weekEntries.filter((e) => e.type === "gasto").reduce((sum, e) => sum + e.amount, 0)
      const weekInversiones = weekEntries.filter((e) => e.type === "inversion").reduce((sum, e) => sum + e.amount, 0)

      return {
        semana: format(weekStart, "dd/MM"),
        ingresos: weekIngresos,
        gastos: weekGastos,
        inversiones: weekInversiones,
        balance: weekIngresos - weekInversiones,
        roi: weekInversiones > 0 ? ((weekIngresos - weekInversiones) / weekInversiones) * 100 : 0,
      }
    })

    // Métricas avanzadas
    const promedioIngresosDiarios =
      ingresos / (differenceInDays(endOfMonth(currentDate), startOfMonth(currentDate)) + 1)
    const promedioGastosDiarios = gastos / (differenceInDays(endOfMonth(currentDate), startOfMonth(currentDate)) + 1)
    const eficienciaInversion = inversiones > 0 ? (balance / inversiones) * 100 : 0
    const tasaAhorro = ingresos > 0 ? ((ingresos - gastos - inversiones) / ingresos) * 100 : 0

    return {
      gastos,
      ingresos,
      inversiones,
      balance,
      categoriasMasUsadas,
      tendenciaSemanal,
      promedioIngresosDiarios,
      promedioGastosDiarios,
      eficienciaInversion,
      tasaAhorro,
    }
  }, [filteredEntries, currentDate])

  const chartData = useMemo(() => {
    // Datos para gráfico de evolución
    const evolucionData = analytics.tendenciaSemanal.map((week) => ({
      name: week.semana,
      ingresos: week.ingresos,
      gastos: week.gastos,
      inversiones: week.inversiones,
      balance: week.balance,
      roi: week.roi,
    }))

    // Datos para gráfico de distribución por tipo
    const distribucionTipos = [
      { name: "Ingresos", value: analytics.ingresos },
      { name: "Gastos", value: analytics.gastos },
      { name: "Inversiones", value: analytics.inversiones },
    ]

    return {
      evolucionData,
      distribucionTipos,
    }
  }, [analytics])

  const insights = useMemo(() => {
    const insights = []

    if (analytics.eficienciaInversion > 20) {
      insights.push({
        type: "success",
        title: "🎯 Excelente ROI",
        message: `Tus inversiones tienen una eficiencia del ${analytics.eficienciaInversion.toFixed(1)}%`,
        icon: Target,
      })
    } else if (analytics.eficienciaInversion < 0) {
      insights.push({
        type: "warning",
        title: "⚠️ Inversiones en pérdida",
        message: `Tus inversiones están generando pérdidas del ${Math.abs(analytics.eficienciaInversion).toFixed(1)}%`,
        icon: AlertTriangle,
      })
    }

    if (analytics.tasaAhorro > 30) {
      insights.push({
        type: "success",
        title: "💰 Excelente ahorro",
        message: `Estás ahorrando el ${analytics.tasaAhorro.toFixed(1)}% de tus ingresos`,
        icon: Award,
      })
    }

    if (analytics.promedioIngresosDiarios > analytics.promedioGastosDiarios * 2) {
      insights.push({
        type: "success",
        title: "📈 Flujo positivo",
        message: `Tus ingresos diarios duplican tus gastos diarios`,
        icon: TrendingUp,
      })
    }

    return insights
  }, [analytics])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 dark:border-green-400"></div>
              <span className="dark:text-gray-200">Cargando análisis...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">🎯 Análisis Avanzado</h1>
            <ConnectionStatus />
          </div>

          <div className="flex gap-2 items-center">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="thisWeek">📅 Esta Semana</SelectItem>
                <SelectItem value="thisMonth">📅 Este Mes</SelectItem>
                <SelectItem value="thisYear">📅 Este Año</SelectItem>
              </SelectContent>
            </Select>

            {selectedPeriod === "thisMonth" && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700"
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700"
                >
                  →
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                <Calculator className="w-4 h-4" />💰 Promedio Ingresos/Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                ${analytics.promedioIngresosDiarios.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />💸 Promedio Gastos/Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                ${analytics.promedioGastosDiarios.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <Target className="w-4 h-4" />📈 Eficiencia Inversión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${analytics.eficienciaInversion >= 0 ? "text-purple-700 dark:text-purple-400" : "text-red-700 dark:text-red-400"}`}
              >
                {analytics.eficienciaInversion.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />💎 Tasa de Ahorro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${analytics.tasaAhorro >= 0 ? "text-blue-700 dark:text-blue-400" : "text-orange-700 dark:text-orange-400"}`}
              >
                {analytics.tasaAhorro.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <Card
                key={index}
                className={`${
                  insight.type === "success"
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <insight.icon
                      className={`w-5 h-5 mt-0.5 ${insight.type === "success" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
                    />
                    <div>
                      <h3
                        className={`font-semibold ${insight.type === "success" ? "text-green-800 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`}
                      >
                        {insight.title}
                      </h3>
                      <p
                        className={`text-sm ${insight.type === "success" ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400"}`}
                      >
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs defaultValue="evolution" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 dark:bg-gray-800">
            <TabsTrigger value="evolution" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-700">
              📈 Evolución
            </TabsTrigger>
            <TabsTrigger value="distribution" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-700">
              🥧 Distribución
            </TabsTrigger>
            <TabsTrigger value="performance" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-700">
              ⚡ Rendimiento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evolution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-2 dark:bg-gray-800/50 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BarChart3 className="w-5 h-5" />📊 Evolución Semanal Completa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <FinanceChart
                      type="bar"
                      data={chartData.evolucionData}
                      keys={["ingresos", "gastos", "inversiones"]}
                      colors={["#22c55e", "#ef4444", "#8b5cf6"]}
                      indexBy="name"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <TrendingUp className="w-5 h-5" />📈 Balance Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <FinanceChart
                      type="bar"
                      data={chartData.evolucionData}
                      keys={["balance"]}
                      colors={["#3b82f6"]}
                      indexBy="name"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Target className="w-5 h-5" />🎯 ROI Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <FinanceChart
                      type="bar"
                      data={chartData.evolucionData}
                      keys={["roi"]}
                      colors={["#8b5cf6"]}
                      indexBy="name"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dark:bg-gray-800/50 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <PieChart className="w-5 h-5" />🥧 Distribución por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <FinanceChart
                      type="pie"
                      data={chartData.distribucionTipos}
                      colors={["#22c55e", "#ef4444", "#8b5cf6"]}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Eye className="w-5 h-5" />
                    👁️ Resumen Detallado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="font-medium text-green-800 dark:text-green-300">💰 Total Ingresos</span>
                      <span className="font-bold text-green-700 dark:text-green-400">
                        ${analytics.ingresos.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="font-medium text-red-800 dark:text-red-300">💸 Total Gastos</span>
                      <span className="font-bold text-red-700 dark:text-red-400">
                        ${analytics.gastos.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="font-medium text-purple-800 dark:text-purple-300">📈 Total Inversiones</span>
                      <span className="font-bold text-purple-700 dark:text-purple-400">
                        ${analytics.inversiones.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between items-center p-3 rounded-lg ${analytics.balance >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-orange-50 dark:bg-orange-900/20"}`}
                    >
                      <span
                        className={`font-medium ${analytics.balance >= 0 ? "text-blue-800 dark:text-blue-300" : "text-orange-800 dark:text-orange-300"}`}
                      >
                        💎 Balance Neto
                      </span>
                      <span
                        className={`font-bold ${analytics.balance >= 0 ? "text-blue-700 dark:text-blue-400" : "text-orange-700 dark:text-orange-400"}`}
                      >
                        ${analytics.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.tendenciaSemanal.map((week, index) => (
                <Card key={index} className="dark:bg-gray-800/50 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg dark:text-gray-100">📅 Semana {week.semana}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="font-bold text-green-600 dark:text-green-400">
                          ${week.ingresos.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">💰 Ingresos</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="font-bold text-red-600 dark:text-red-400">${week.gastos.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">💸 Gastos</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          ${week.inversiones.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">📈 Inversiones</div>
                      </div>
                      <div
                        className={`text-center p-2 rounded ${week.balance >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-orange-50 dark:bg-orange-900/20"}`}
                      >
                        <div
                          className={`font-bold ${week.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}
                        >
                          ${week.balance.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">💎 Balance</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge
                        variant={week.roi >= 0 ? "default" : "destructive"}
                        className={
                          week.roi >= 0 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : ""
                        }
                      >
                        🎯 ROI: {week.roi.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
