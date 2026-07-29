import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuyers, useUpdateBuyer, type BuyerRow } from '../../lib/queries/buyers'
import { formatDate, toDateKey } from '../../lib/format'
import { Card, EmptyState } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { QueryState } from '../../components/ui/QueryState'
import { ChevronIcon } from '../../components/icons'
import { cn } from '../../lib/cn'

const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

const MONTH_FORMAT = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' })

/** כל תאי הלוח לחודש, כולל ריפוד לימים של החודשים השכנים. */
function monthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay()) // תמיד מתחילים ביום ראשון

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function CalendarTab() {
  const { data: buyers, isPending, isPaused, error, refetch } = useBuyers()
  const updateBuyer = useUpdateBuyer()

  const [anchor, setAnchor] = useState(() => new Date())
  const [selected, setSelected] = useState<string>(() => toDateKey(new Date()))

  const todayKey = toDateKey(new Date())

  /** מפתח יום → הלקוחות שצריך לחזור אליהם באותו יום. */
  const byDay = useMemo(() => {
    const map = new Map<string, BuyerRow[]>()
    for (const buyer of buyers ?? []) {
      if (!buyer.callback_date) continue
      const list = map.get(buyer.callback_date)
      if (list) list.push(buyer)
      else map.set(buyer.callback_date, [buyer])
    }
    return map
  }, [buyers])

  const days = useMemo(() => monthGrid(anchor), [anchor])
  const selectedBuyers = byDay.get(selected) ?? []
  const totalOpen = useMemo(
    () => (buyers ?? []).filter((b) => b.callback_date && !b.callback_done).length,
    [buyers],
  )

  const shiftMonth = (delta: number) =>
    setAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800">לוח שנה</h1>
        {totalOpen > 0 && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            {totalOpen} ממתינים
          </span>
        )}
      </div>

      <QueryState
        isPending={isPending}
        isPaused={isPaused}
        error={error}
        onRetry={() => void refetch()}
        loadingLabel="טוען לוח שנה…"
      />

      {buyers && (
        <>
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-brand-100 px-4 py-3">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
              >
                <ChevronIcon className="size-5 rotate-180" />
                <span className="sr-only">חודש קודם</span>
              </button>

              <p className="flex-1 text-center font-bold text-slate-800">
                {MONTH_FORMAT.format(anchor)}
              </p>

              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
              >
                <ChevronIcon className="size-5" />
                <span className="sr-only">חודש הבא</span>
              </button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const now = new Date()
                  setAnchor(now)
                  setSelected(toDateKey(now))
                }}
              >
                היום
              </Button>
            </div>

            <div className="grid grid-cols-7 border-b border-brand-100 bg-brand-50/50">
              {DAY_NAMES.map((name) => (
                <div key={name} className="py-2 text-center text-xs font-bold text-brand-700">
                  {name}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day) => {
                const key = toDateKey(day)
                const inMonth = day.getMonth() === anchor.getMonth()
                const dayBuyers = byDay.get(key) ?? []
                const isToday = key === todayKey
                const isSelected = key === selected

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSelected(key)}
                    className={cn(
                      'flex min-h-16 flex-col items-stretch gap-0.5 border-b border-s border-brand-100 p-1 text-start transition-colors sm:min-h-20',
                      inMonth ? 'bg-white' : 'bg-slate-50/60',
                      isSelected && 'ring-2 ring-brand-500 ring-inset',
                      'hover:bg-brand-50',
                    )}
                  >
                    <span
                      className={cn(
                        'ltr-nums self-start rounded-md px-1.5 text-xs font-semibold',
                        isToday && 'bg-brand-500 text-white',
                        !isToday && inMonth && 'text-slate-600',
                        !isToday && !inMonth && 'text-slate-300',
                      )}
                    >
                      {day.getDate()}
                    </span>

                    {dayBuyers.slice(0, 2).map((buyer) => (
                      <span
                        key={buyer.id}
                        title={buyer.full_name}
                        className={cn(
                          'truncate rounded px-1 py-0.5 text-[10px] font-semibold sm:text-[11px]',
                          buyer.callback_done
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800',
                        )}
                      >
                        {buyer.full_name}
                      </span>
                    ))}

                    {dayBuyers.length > 2 && (
                      <span className="px-1 text-[10px] font-semibold text-slate-500">
                        +{dayBuyers.length - 2}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="mt-4 p-5">
            <h2 className="mb-3 text-sm font-bold text-brand-700">{formatDate(selected)}</h2>

            {selectedBuyers.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                אין שיחות שנקבעו ליום הזה.
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedBuyers.map((buyer) => (
                  <li
                    key={buyer.id}
                    className={cn(
                      'flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 ring-1',
                      buyer.callback_done
                        ? 'bg-green-50 text-green-900 ring-green-200'
                        : 'bg-red-50 text-red-900 ring-red-200',
                    )}
                  >
                    <Link to={`/buyers/${buyer.id}`} className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{buyer.full_name}</span>
                      <span className="ltr-nums block truncate text-xs opacity-75">
                        {buyer.phone || '—'}
                      </span>
                    </Link>

                    <Button
                      size="sm"
                      variant="secondary"
                      loading={updateBuyer.isPending}
                      onClick={() =>
                        // הקוביה נשארת על היום שנקבע — הסימון רק מחליף אדום/ירוק
                        updateBuyer.mutate({
                          id: buyer.id,
                          patch: { callback_done: !buyer.callback_done },
                        })
                      }
                    >
                      {buyer.callback_done ? 'סמן שעוד לא חזרת' : 'סמן שחזרתי'}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {buyers.length === 0 && (
            <div className="mt-4">
              <EmptyState
                title="אין עדיין לקוחות"
                description="קבע שיחה מתוך כרטיסיית לקוח, והיא תופיע כאן ביום שבחרת."
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
