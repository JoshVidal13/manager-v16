"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  Award,
  AlertTriangle,
  DollarSign,
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
} from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useEntries } from "@/hooks/use-entries"
import { ConnectionStatus } from "@/components/connection-status"
import { createLocalDate } from "@/lib/date-utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { FinanceChart } from "@/components/finance-chart"

interface WeeklyData {
  week: string
  weekStart: Date
  weekEnd: Date
  ingresos: number
  gastos: number
  inversiones: number
  balance: number
  entries: any[]
}

interface CategoryData {
  category: string
  amount: number
  percentage: number
  entries: any[]
  trend: "up" | "down" | "stable"
}

const CATEGORY_COLORS = {
  // Gastos
  Carne: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  Agua: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  Gas: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  Salarios:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  Insumos:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  Transporte:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  Servicios:
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  Refresco: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
  Otros: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
  Cambio: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
  // Ingresos
  Efectivo:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
  Transferencia:
    "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
  Ventas: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800",
}

export default function ReportsPage() {
  const { entries, loading } = useEntries()
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState("categories")

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

  const weeklyData = useMemo(() => {
    if (selectedPeriod !== "thisMonth") return []

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    // CAMBIADO: Ahora las semanas empiezan en jueves (4)
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 4 })

    return weeks.map((weekStart) => {
      // CAMBIADO: Ahora las semanas empiezan en jueves (4)
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 4 })
      const weekEntries = entries.filter((entry) => {
        const entryDate = createLocalDate(entry.date)
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd })
      })

      const ingresos = weekEntries.filter((e) => e.type === "ingreso").reduce((sum, e) => sum + e.amount, 0)
      const gastos = weekEntries.filter((e) => e.type === "gasto").reduce((sum, e) => sum + e.amount, 0)
      const inversiones = weekEntries.filter((e) => e.type === "inversion").reduce((sum, e) => sum + e.amount, 0)

      return {
        week: `Semana ${format(weekStart, "d")} - ${format(weekEnd, "d MMM")}`,
        weekStart,
        weekEnd,
        ingresos,
        gastos,
        inversiones,
        balance: ingresos - inversiones,
        entries: weekEntries,
      }
    })
  }, [entries, currentDate, selectedPeriod])

  const categoryAnalysis = useMemo(() => {
    const gastoCategories: { [key: string]: CategoryData } = {}
    const ingresoCategories: { [key: string]: CategoryData } = {}
    const inversionCategories: { [key: string]: CategoryData } = {}

    const gastoEntries = filteredEntries.filter((e) => e.type === "gasto")
    const ingresoEntries = filteredEntries.filter((e) => e.type === "ingreso")
    const inversionEntries = filteredEntries.filter((e) => e.type === "inversion")

    const totalGastos = gastoEntries.reduce((sum, e) => sum + e.amount, 0)
    const totalIngresos = ingresoEntries.reduce((sum, e) => sum + e.amount, 0)
    const totalInversiones = inversionEntries.reduce((sum, e) => sum + e.amount, 0)

    // Analizar gastos por categoría
    gastoEntries.forEach((entry) => {
      if (!gastoCategories[entry.category]) {
        gastoCategories[entry.category] = {
          category: entry.category,
          amount: 0,
          percentage: 0,
          entries: [],
          trend: "stable",
        }
      }
      gastoCategories[entry.category].amount += entry.amount
      gastoCategories[entry.category].entries.push(entry)
    })

    // Calcular porcentajes para gastos
    Object.values(gastoCategories).forEach((cat) => {
      cat.percentage = totalGastos > 0 ? (cat.amount / totalGastos) * 100 : 0
    })

    // Analizar ingresos por categoría
    ingresoEntries.forEach((entry) => {
      if (!ingresoCategories[entry.category]) {
        ingresoCategories[entry.category] = {
          category: entry.category,
          amount: 0,
          percentage: 0,
          entries: [],
          trend: "stable",
        }
      }
      ingresoCategories[entry.category].amount += entry.amount
      ingresoCategories[entry.category].entries.push(entry)
    })

    // Calcular porcentajes para ingresos
    Object.values(ingresoCategories).forEach((cat) => {
      cat.percentage = totalIngresos > 0 ? (cat.amount / totalIngresos) * 100 : 0
    })

    // Analizar inversiones por categoría
    inversionEntries.forEach((entry) => {
      if (!inversionCategories[entry.category]) {
        inversionCategories[entry.category] = {
          category: entry.category,
          amount: 0,
          percentage: 0,
          entries: [],
          trend: "stable",
        }
      }
      inversionCategories[entry.category].amount += entry.amount
      inversionCategories[entry.category].entries.push(entry)
    })

    // Calcular porcentajes para inversiones
    Object.values(inversionCategories).forEach((cat) => {
      cat.percentage = totalInversiones > 0 ? (cat.amount / totalInversiones) * 100 : 0
    })

    return {
      gastos: Object.values(gastoCategories).sort((a, b) => b.amount - a.amount),
      ingresos: Object.values(ingresoCategories).sort((a, b) => b.amount - a.amount),
      inversiones: Object.values(inversionCategories).sort((a, b) => b.amount - a.amount),
    }
  }, [filteredEntries])

  const periodTotals = useMemo(() => {
    const ingresos = filteredEntries.filter((e) => e.type === "ingreso").reduce((sum, e) => sum + e.amount, 0)
    const gastos = filteredEntries.filter((e) => e.type === "gasto").reduce((sum, e) => sum + e.amount, 0)
    const inversiones = filteredEntries.filter((e) => e.type === "inversion").reduce((sum, e) => sum + e.amount, 0)

    return {
      ingresos,
      gastos,
      inversiones,
      balance: ingresos - inversiones,
      entries: filteredEntries.length,
    }
  }, [filteredEntries])

  // Datos para gráficos
  const chartData = useMemo(() => {
    // Datos para gráfico de categorías de gastos
    const gastosCategorias = categoryAnalysis.gastos.map((cat) => ({
      name: cat.category,
      value: cat.amount,
    }))

    // Datos para gráfico de categorías de ingresos
    const ingresosCategorias = categoryAnalysis.ingresos.map((cat) => ({
      name: cat.category,
      value: cat.amount,
    }))

    // Datos para gráfico de categorías de inversiones
    const inversionesCategorias = categoryAnalysis.inversiones.map((cat) => ({
      name: cat.category,
      value: cat.amount,
    }))

    // Datos para gráfico de tendencia semanal
    const semanasData = weeklyData.map((week) => ({
      name: format(week.weekStart, "dd/MM"),
      ingresos: week.ingresos,
      gastos: week.gastos,
      inversiones: week.inversiones,
      balance: week.balance,
    }))

    return {
      gastosCategorias,
      ingresosCategorias,
      inversionesCategorias,
      semanasData,
    }
  }, [categoryAnalysis, weeklyData])

  const insights = useMemo(() => {
    const insights = []

    if (categoryAnalysis.gastos.length > 0) {
      const topGasto = categoryAnalysis.gastos[0]
      if (topGasto.percentage > 40) {
        insights.push({
          type: "warning",
          title: "Concentración de gastos",
          message: `${topGasto.category} representa el ${topGasto.percentage.toFixed(1)}% de tus gastos`,
          icon: AlertTriangle,
        })
      }
    }

    if (periodTotals.balance > 0) {
      insights.push({
        type: "success",
        title: "¡Excelente gestión!",
        message: `Tienes un superávit de $${periodTotals.balance.toLocaleString()}`,
        icon: Award,
      })
    }

    const savingsRate = periodTotals.ingresos > 0 ? (periodTotals.balance / periodTotals.ingresos) * 100 : 0
    if (savingsRate > 20) {
      insights.push({
        type: "success",
        title: "Gran tasa de ahorro",
        message: `Estás ahorrando el ${savingsRate.toFixed(1)}% de tus ingresos`,
        icon: Target,
      })
    }

    return insights
  }, [categoryAnalysis, periodTotals])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 dark:border-purple-400"></div>
              <span className="dark:text-gray-200">Cargando reportes...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">📊 Reportes Detallados</h1>
            <ConnectionStatus />
          </div>

          <div className="flex gap-2 items-center">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="thisWeek">Esta Semana</SelectItem>
                <SelectItem value="thisMonth">Este Mes</SelectItem>
                <SelectItem value="thisYear">Este Año</SelectItem>
              </SelectContent>
            </Select>

            {selectedPeriod === "thisMonth" && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  →
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Period Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                ${periodTotals.ingresos.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                ${periodTotals.gastos.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Inversiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                ${periodTotals.inversiones.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card
            className={`${periodTotals.balance >= 0 ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800"}`}
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={`text-sm font-medium flex items-center gap-2 ${periodTotals.balance >= 0 ? "text-blue-800 dark:text-blue-300" : "text-orange-800 dark:text-orange-300"}`}
              >
                <DollarSign className="w-4 h-4" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${periodTotals.balance >= 0 ? "text-blue-700 dark:text-blue-400" : "text-orange-700 dark:text-orange-400"}`}
              >
                ${periodTotals.balance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Movimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{periodTotals.entries}</div>
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

        {/* Gráficos de distribución */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <PieChart className="w-5 h-5" />📊 Distribución de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <FinanceChart
                  type="pie"
                  data={chartData.gastosCategorias}
                  colors={[
                    "#ef4444",
                    "#f97316",
                    "#f59e0b",
                    "#eab308",
                    "#84cc16",
                    "#22c55e",
                    "#14b8a6",
                    "#06b6d4",
                    "#0ea5e9",
                    "#6366f1",
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <PieChart className="w-5 h-5" />📊 Distribución de Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <FinanceChart
                  type="pie"
                  data={chartData.ingresosCategorias}
                  colors={["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d", "#84cc16"]}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <PieChart className="w-5 h-5" />📊 Distribución de Inversiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <FinanceChart
                  type="pie"
                  data={chartData.inversionesCategorias}
                  colors={["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#a855f7"]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="categories" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 dark:text-gray-200 dark:data-[state=active]:bg-gray-700"
            >
              <PieChart className="w-4 h-4" />
              Por Categorías
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="flex items-center gap-2 dark:text-gray-200 dark:data-[state=active]:bg-gray-700"
              disabled={selectedPeriod !== "thisMonth"}
            >
              <Calendar className="w-4 h-4" />
              Por Semanas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gastos por Categoría */}
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-red-300 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Gastos por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryAnalysis.gastos.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay gastos en este período</p>
                  ) : (
                    categoryAnalysis.gastos.map((category, index) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"} text-xs`}
                            >
                              #{index + 1}
                            </Badge>
                            <span className="font-medium dark:text-gray-200">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600 dark:text-red-400">
                              ${category.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Progress value={category.percentage} className="h-2" />
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {category.entries.length} movimiento{category.entries.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Ingresos por Categoría */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-300 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Ingresos por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryAnalysis.ingresos.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay ingresos en este período</p>
                  ) : (
                    categoryAnalysis.ingresos.map((category, index) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"} text-xs`}
                            >
                              #{index + 1}
                            </Badge>
                            <span className="font-medium dark:text-gray-200">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              ${category.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Progress value={category.percentage} className="h-2" />
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {category.entries.length} movimiento{category.entries.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            {selectedPeriod === "thisMonth" && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {format(currentDate, "MMMM yyyy", { locale: es })}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">Análisis semanal detallado</p>
                </div>

                {/* Gráfico de tendencia semanal */}
                <Card className="dark:bg-gray-800/50 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                      <BarChart3 className="w-5 h-5" />📊 Tendencia Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <FinanceChart
                        type="bar"
                        data={chartData.semanasData}
                        keys={["ingresos", "gastos", "inversiones"]}
                        colors={["#22c55e", "#ef4444", "#8b5cf6"]}
                        indexBy="name"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {weeklyData.map((week, index) => (
                    <Card
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-lg dark:text-gray-100">{week.week}</span>
                          <Badge
                            variant={week.balance >= 0 ? "default" : "destructive"}
                            className={`text-sm ${week.balance >= 0 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : ""}`}
                          >
                            {week.balance >= 0 ? "Superávit" : "Déficit"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              ${week.ingresos.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Ingresos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              ${week.gastos.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Gastos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              ${week.inversiones.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Inversiones</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${week.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}
                            >
                              ${week.balance.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Balance</div>
                          </div>
                        </div>

                        {week.entries.length > 0 && (
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                              Movimientos de la semana:
                            </h4>
                            {week.entries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between text-sm bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      entry.type === "ingreso"
                                        ? "default"
                                        : entry.type === "inversion"
                                          ? "secondary"
                                          : "destructive"
                                    }
                                    className={`text-xs ${entry.type === "inversion" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300" : ""}`}
                                  >
                                    {entry.category}
                                  </Badge>
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {format(new Date(entry.date), "dd/MM")}
                                  </span>
                                </div>
                                <span
                                  className={`font-medium ${entry.type === "ingreso" ? "text-green-600 dark:text-green-400" : entry.type === "inversion" ? "text-purple-600 dark:text-purple-400" : "text-red-600 dark:text-red-400"}`}
                                >
                                  ${entry.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
