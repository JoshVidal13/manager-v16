"use client"

import { createLocalDate, getDayName, getMonthName } from "@/lib/date-utils"

interface DateDisplayProps {
  date: string
  className?: string
}

export function DateDisplay({ date, className = "" }: DateDisplayProps) {
  const dateObj = createLocalDate(date)
  const dayName = getDayName(date).substring(0, 3) // Abreviar día
  const dayNumber = dateObj.getDate()
  const monthName = getMonthName(date).substring(0, 3) // Abreviar mes
  const year = dateObj.getFullYear()

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 min-w-[80px]">
        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">{dayName}</div>
        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 leading-none">{dayNumber}</div>
        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          {monthName} {year}
        </div>
      </div>
    </div>
  )
}
