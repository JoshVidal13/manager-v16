"use client"

import { useMemo } from "react"
import { ResponsivePie } from "@nivo/pie"
import { ResponsiveBar } from "@nivo/bar"
import { ResponsiveLine } from "@nivo/line"
import { useTheme } from "next-themes"

interface ChartData {
  name: string
  value: number
}

interface BarData {
  name: string
  [key: string]: string | number
}

interface LineData {
  id: string
  color: string
  data: Array<{
    x: string | number
    y: number | null
  }>
}

interface FinanceChartProps {
  type: "pie" | "bar" | "line"
  data: ChartData[] | BarData[]
  colors?: string[]
  keys?: string[]
  indexBy?: string
}

export function FinanceChart({ type, data, colors, keys, indexBy = "name" }: FinanceChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Transformar datos para gráfico de pie
  const pieData = useMemo(() => {
    if (type !== "pie") return []
    return (data as ChartData[]).map((item) => ({
      id: item.name,
      label: item.name,
      value: item.value,
    }))
  }, [data, type])

  // Transformar datos para gráfico de línea
  const lineData = useMemo(() => {
    if (type !== "line" || !keys) return []

    return keys.map((key, index) => ({
      id: key,
      color: colors ? colors[index % colors.length] : "#000",
      data: (data as BarData[]).map((d) => ({
        x: d[indexBy] as string,
        y: d[key] as number,
      })),
    }))
  }, [data, type, keys, colors, indexBy])

  // Configuración común para los gráficos
  const textColor = isDark ? "#e5e7eb" : "#1f2937"
  const gridColor = isDark ? "#374151" : "#e5e7eb"
  const backgroundColor = "transparent"

  if (type === "pie") {
    return (
      <ResponsivePie
        data={pieData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={colors}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={textColor}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: textColor,
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
          },
        ]}
        theme={{
          text: {
            fill: textColor,
          },
          tooltip: {
            container: {
              background: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#e5e7eb" : "#1f2937",
              fontSize: "12px",
            },
          },
        }}
      />
    )
  }

  if (type === "bar") {
    return (
      <ResponsiveBar
        data={data as BarData[]}
        keys={keys || []}
        indexBy={indexBy}
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={colors}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Semana",
          legendPosition: "middle",
          legendOffset: 32,
          truncateTickAt: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Monto ($)",
          legendPosition: "middle",
          legendOffset: -40,
          truncateTickAt: 0,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
            itemTextColor: textColor,
          },
        ]}
        role="application"
        ariaLabel="Gráfico de barras de finanzas"
        barAriaLabel={(e) => `${e.id}: ${e.formattedValue} en semana: ${e.indexValue}`}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: textColor,
              },
            },
            legend: {
              text: {
                fill: textColor,
              },
            },
            ticks: {
              line: {
                stroke: textColor,
                strokeWidth: 1,
              },
              text: {
                fill: textColor,
              },
            },
          },
          grid: {
            line: {
              stroke: gridColor,
              strokeWidth: 1,
            },
          },
          legends: {
            text: {
              fill: textColor,
            },
          },
          tooltip: {
            container: {
              background: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#e5e7eb" : "#1f2937",
              fontSize: "12px",
            },
          },
        }}
      />
    )
  }

  if (type === "line") {
    return (
      <ResponsiveLine
        data={[
          {
            id: keys ? keys[0] : "value",
            color: colors ? colors[0] : "#000",
            data: (data as ChartData[]).map((d) => ({
              x: d.name,
              y: d.value,
            })),
          },
        ]}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.2f"
        curve="cardinal"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Mes",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Monto ($)",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        colors={colors}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
            itemTextColor: textColor,
          },
        ]}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: textColor,
              },
            },
            legend: {
              text: {
                fill: textColor,
              },
            },
            ticks: {
              line: {
                stroke: textColor,
                strokeWidth: 1,
              },
              text: {
                fill: textColor,
              },
            },
          },
          grid: {
            line: {
              stroke: gridColor,
              strokeWidth: 1,
            },
          },
          legends: {
            text: {
              fill: textColor,
            },
          },
          tooltip: {
            container: {
              background: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#e5e7eb" : "#1f2937",
              fontSize: "12px",
            },
          },
        }}
      />
    )
  }

  return null
}
