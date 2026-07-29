import { Button } from './Button'

/**
 * מצבי טעינה/שגיאה/ניתוק אחידים.
 *
 * שני כללים:
 * 1. אף מצב לא מרנדר כלום — מסך ריק בלי הסבר הוא באג, לא "עדיין טוען".
 * 2. כשכבר יש נתונים על המסך, כישלון של רענון־רקע לא מוחק אותם. React Query
 *    משהה רענון כשהחלון לא בפוקוס או כשאין רשת, וזה קורה כל הזמן במובייל.
 *    הנתונים שבזיכרון עדיין שימושיים למתווך שעומד מול לקוח.
 */
export function QueryState({
  isPending,
  isPaused,
  error,
  hasData = false,
  onRetry,
  loadingLabel = 'טוען…',
}: {
  isPending: boolean
  isPaused: boolean
  error: Error | null
  hasData?: boolean
  onRetry?: () => void
  loadingLabel?: string
}) {
  // יש נתונים: לכל היותר רצועה דקה על כישלון רענון, ולעולם לא השתלטות על המסך
  if (hasData) {
    if (!error) return null
    return (
      <p className="mb-3 rounded-xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
        לא הצלחתי לרענן — מוצגים הנתונים האחרונים שנטענו.
      </p>
    )
  }

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
