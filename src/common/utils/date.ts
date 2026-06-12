import { format, isValid } from 'date-fns'

export function formatDisplayDate(date: string) {
  const normalized = date.includes('T') ? date : `${date}T00:00:00`
  const parsed = new Date(normalized)
  if (!isValid(parsed)) return date
  return format(parsed, 'dd/MM/yyyy')
}

export function formatDisplayTime(value?: string) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (!isValid(parsed)) return '-'
  return format(parsed, 'HH:mm:ss')
}
