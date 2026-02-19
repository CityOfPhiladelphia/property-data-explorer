import { parseISO, format } from 'date-fns'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
})

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'N/A'
  return currencyFormatter.format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'N/A'
  try {
    return format(parseISO(value), 'MM/dd/yyyy')
  } catch {
    return 'N/A'
  }
}

export function formatSortableDate(value: string | null | undefined): string {
  if (!value) return ''
  try {
    return format(parseISO(value), 'yyyyMMdd')
  } catch {
    return ''
  }
}
