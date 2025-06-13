/**
 * Utilidades para manejar fechas sin problemas de zona horaria
 */

// Convertir una fecha a string en formato YYYY-MM-DD sin conversión de zona horaria
export function formatDateForStorage(date: Date | string): string {
  if (typeof date === "string") {
    // Si ya es string, verificar que esté en formato correcto
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (dateRegex.test(date)) {
      return date
    }
    // Si no está en formato correcto, convertir
    date = new Date(date)
  }

  // Usar getFullYear, getMonth, getDate para evitar problemas de zona horaria
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// Crear una fecha local desde un string YYYY-MM-DD
export function createLocalDate(dateString: string): Date {
  // Dividir la fecha para evitar conversión automática de zona horaria
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

// Obtener la fecha actual en formato YYYY-MM-DD
export function getCurrentDateString(): string {
  return formatDateForStorage(new Date())
}

// Verificar si dos fechas son el mismo día
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const dateStr1 = formatDateForStorage(date1)
  const dateStr2 = formatDateForStorage(date2)
  return dateStr1 === dateStr2
}

// Obtener el nombre del día de la semana
export function getDayName(dateString: string): string {
  const date = createLocalDate(dateString)
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  return days[date.getDay()]
}

// Obtener el nombre del mes
export function getMonthName(dateString: string): string {
  const date = createLocalDate(dateString)
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  return months[date.getMonth()]
}

// Formatear fecha para mostrar (ej: "Lunes 5 de Marzo")
export function formatDateForDisplay(dateString: string): string {
  const date = createLocalDate(dateString)
  const dayName = getDayName(dateString)
  const day = date.getDate()
  const monthName = getMonthName(dateString)

  return `${dayName} ${day} de ${monthName}`
}
