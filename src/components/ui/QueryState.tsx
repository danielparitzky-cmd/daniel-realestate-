import { Button } from './Button'

/**
 * מצבי טעינה/שגיאה/ניתוק אחידים.
 * הכלל: אף מצב לא מרנדר כלום — מסך ריק בלי הסבר הוא באג, לא "עדיין טוען".
 */
export function QueryState({
  isPending,
  isPaused,
  error,
  onRetry,
  loadingLabel = 'טוען…',
}: {
  isPending: boolean
  isPaused: boolean
  error: Error | null
  onRetry?: () => void
  loadingLabel?: string
}) {
  if (isPaused) {
    return (
      <div className="rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
        <p className="font-semibold">אין חיבור לאינטרנט</p>
        <p className="mt-1 text-amber-800">הבקשה תמתין עד שהחיבור יחזור.</p>
        {onRetry && (
          <Button size="sm" variant="secondary" className="mt-3" onClick={onRetry}>
            נסה שוב
          </Button>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-800 ring-1 ring-red-200"
      >
        <p className="font-semibold">משהו נכשל</p>
        <p className="mt-1">{error.message}</p>
        {onRetry && (
          <Button size="sm" variant="secondary" className="mt-3" onClick={onRetry}>
            נסה שוב
          </Button>
        )}
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
        <span className="size-5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
        {loadingLabel}
      </div>
    )
  }

  return null
}
