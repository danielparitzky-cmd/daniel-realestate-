const ILS = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
})

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '—'
  return ILS.format(value)
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * עמודות date מגיעות כ-"YYYY-MM-DD". new Date() על מחרוזת כזו פורסת אותה
 * כחצות UTC, מה שמזיז את התאריך ביום שלם באזורי זמן מאחורי UTC.
 * לכן בונים תאריך מקומי במפורש.
 */
function parseLocal(value: string | Date): Date {
  if (typeof value !== 'string') return value
  const m = DATE_ONLY.exec(value)
  if (!m) return new Date(value)
  const [y, mo, d] = value.split('-').map(Number)
  return new Date(y, mo - 1, d)
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  return parseLocal(value).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** yyyy-mm-dd בזמן מקומי — לעמודות date בלי הסטת אזור זמן. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
