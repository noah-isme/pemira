/**
 * Utility functions for date formatting
 */

const DAYS_OF_WEEK = [
    'minggu',
    'senin',
    'selasa',
    'rabu',
    'kamis',
    'jumat',
    'sabtu'
] as const

const MONTHS = [
    'januari',
    'februari',
    'maret',
    'april',
    'mei',
    'juni',
    'juli',
    'agustus',
    'september',
    'oktober',
    'november',
    'desember'
] as const

/**
 * Format date string from "DD/MM/YYYY, HH.mm" to Indonesian format
 * Example: "01/11/2025, 08.00" -> "sabtu, 1 november 2025, pukul 08:00"
 */
export const formatIndonesianDateTime = (dateTimeStr: string): string => {
    // Parse the input format "DD/MM/YYYY, HH.mm"
    const [datePart, timePart] = dateTimeStr.split(', ')
    const [day, month, year] = datePart.split('/').map(Number)
    const [hours, minutes] = timePart.split('.').map(Number)

    // Create Date object (month is 0-indexed in JS)
    const date = new Date(year, month - 1, day, hours, minutes)

    // Get day name and format date
    const dayName = DAYS_OF_WEEK[date.getDay()]
    const monthName = MONTHS[date.getMonth()]
    const dayNumber = date.getDate()
    const yearNumber = date.getFullYear()

    // Format time
    const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    return `${dayName}, ${dayNumber} ${monthName} ${yearNumber}, pukul ${timeFormatted}`
}

/**
 * Format date range for display
 * Example: "01/11/2025, 08.00 - 30/11/2025, 16.00"
 */
export const formatDateRange = (startDate: string, endDate: string): { start: string; end: string } => {
    return {
        start: formatIndonesianDateTime(startDate),
        end: formatIndonesianDateTime(endDate)
    }
}