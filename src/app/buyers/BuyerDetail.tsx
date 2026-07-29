import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useAddBuyerUpdate,
  useBuyer,
  useBuyerUpdates,
  useDeleteBuyer,
  useUpdateBuyer,
} from '../../lib/queries/buyers'
import { useAddInterest, useInterests, useRemoveInterest } from '../../lib/queries/interest'
import { useProperties } from '../../lib/queries/properties'
import { BUYER_STATUS, type BuyerStatus } from '../../lib/constants'
import { formatDate, formatDateTime, formatPrice, toDateKey } from '../../lib/format'
import { Card, EmptyState } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { QueryState } from '../../components/ui/QueryState'
import { EntityPicker } from '../../components/EntityPicker'
import { ChevronIcon, TrashIcon } from '../../components/icons'
import { cn } from '../../lib/cn'

export default function BuyerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: buyer, isPending, isPaused, error, refetch } = useBuyer(id)
  const { data: updates } = useBuyerUpdates(id)
  const { data: properties } = useProperties()
  const { data: interests } = useInterests()

  const updateBuyer = useUpdateBuyer()
  const deleteBuyer = useDeleteBuyer()
  const addUpdate = useAddBuyerUpdate()
  const addInterest = useAddInterest()
  const removeInterest = useRemoveInterest()

  const [note, setNote] = useState('')
  const [callbackDraft, setCallbackDraft] = useState<string | null>(null)

  const wishlist = useMemo(() => {
    if (!properties || !interests || !id) return []
    const linked = new Set(
      interests.filter((row) => row.buyer_id === id).map((row) => row.property_id),
    )
    return properties.filter((p) => linked.has(p.id))
  }, [properties, interests, id])

  const available = useMemo(() => {
    const linked = new Set(wishlist.map((p) => p.id))
    return (properties ?? []).filter((p) => !linked.has(p.id))
  }, [properties, wishlist])

  if (!buyer && (isPending || isPaused || error)) {
    return (
      <QueryState
        isPending={isPending}
        isPaused={isPaused}
        error={error}
        onRetry={() => void refetch()}
      />
    )
  }

  if (!buyer) {
    return (
      <EmptyState
        title="הלקוח לא נמצא"
        action={
          <Link to="/buyers">
            <Button variant="secondary">חזרה ללקוחות</Button>
          </Link>
        }
      />
    )
  }

  const save = (patch: Parameters<typeof updateBuyer.mutate>[0]['patch']) =>
    updateBuyer.mutate({ id: buyer.id, patch })

  const callbackValue = callbackDraft ?? buyer.callback_date ?? ''

  return (
    <div className="space-y-4">
      <Link
        to="/buyers"
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ChevronIcon className="size-4 rotate-180" />
        כל הלקוחות
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <input
              defaultValue={buyer.full_name}
              onBlur={(e) => {
                const next = e.target.value.trim()
                if (next && next !== buyer.full_name) save({ full_name: next })
              }}
              className="w-full rounded-lg border-0 bg-transparent px-0 text-2xl font-bold text-slate-800 focus:bg-brand-50 focus:px-2 focus:outline-none"
            />
            <input
              type="tel"
              dir="ltr"
              defaultValue={buyer.phone ?? ''}
              placeholder="050-0000000"
              onBlur={(e) => {
                const next = e.target.value.trim() || null
                if (next !== buyer.phone) save({ phone: next })
              }}
              className="ltr-nums mt-1 w-full rounded-lg border-0 bg-transparent px-0 text-start text-sm text-slate-500 focus:bg-brand-50 focus:px-2 focus:outline-none"
            />
          </div>

          <Button
            size="sm"
            variant="ghost"
            loading={deleteBuyer.isPending}
            className="text-red-600 hover:bg-red-50"
            onClick={() => {
              if (!confirm(`למחוק את ${buyer.full_name} וכל העדכונים שלו?`)) return
              deleteBuyer.mutate(buyer.id, { onSuccess: () => void navigate('/buyers') })
            }}
          >
            <TrashIcon className="size-4" />
            מחק
          </Button>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">סטטוס</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BUYER_STATUS) as BuyerStatus[]).map((key) => {
              const s = BUYER_STATUS[key]
              const active = buyer.status === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => save({ status: key })}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-all',
                    active ? `${s.chip} ring-2` : 'bg-white text-slate-500 ring-brand-200',
                  )}
                >
                  <span className={`size-2 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-sm font-bold text-brand-700">קבע שיחה</h2>
        <p className="mb-3 text-xs text-slate-500">היום שתבחר יופיע בלוח השנה.</p>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={callbackValue}
            min="2000-01-01"
            onChange={(e) => setCallbackDraft(e.target.value)}
            className="ltr-nums w-auto"
          />
          <Button
            size="sm"
            loading={updateBuyer.isPending}
            disabled={!callbackDraft || callbackDraft === buyer.callback_date}
            onClick={() => {
              // תאריך חדש מאפס את הסימון — זו שיחה שעדיין לא קרתה
              save({ callback_date: callbackDraft, callback_done: false })
              setCallbackDraft(null)
            }}
          >
            שמור
          </Button>
          {buyer.callback_date && (
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-500"
              onClick={() => {
                save({ callback_date: null, callback_done: false })
                setCallbackDraft(null)
              }}
            >
              בטל שיחה
            </Button>
          )}
        </div>

        {buyer.callback_date && (
          <div
            className={cn(
              'mt-3 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 ring-1',
              buyer.callback_done
                ? 'bg-green-50 text-green-800 ring-green-200'
                : 'bg-red-50 text-red-800 ring-red-200',
            )}
          >
            <span className="text-sm font-semibold">
              {buyer.callback_done ? 'חזרת אליו ב' : 'לחזור אליו ב'}
              {formatDate(buyer.callback_date)}
              {!buyer.callback_done && buyer.callback_date < toDateKey(new Date()) && ' (עבר)'}
            </span>
            <Button
              size="sm"
              variant="secondary"
              className="ms-auto"
              onClick={() => save({ callback_done: !buyer.callback_done })}
            >
              {buyer.callback_done ? 'סמן שעוד לא חזרת' : 'סמן שחזרת'}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-bold text-brand-700">עדכונים</h2>

        <div className="mb-4">
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="שוחחנו וסיכמנו ש…"
          />
          {note.trim() && (
            <Button
              size="sm"
              className="mt-2"
              loading={addUpdate.isPending}
              onClick={() =>
                addUpdate.mutate(
                  { buyerId: buyer.id, body: note.trim() },
                  { onSuccess: () => setNote('') },
                )
              }
            >
              הוסף עדכון
            </Button>
          )}
        </div>

        {updates && updates.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">אין עדיין עדכונים.</p>
        )}

        <ol className="space-y-2">
          {(updates ?? []).map((entry) => (
            <li key={entry.id} className="rounded-xl bg-brand-50 px-4 py-3">
              <time className="ltr-nums block text-xs font-semibold text-brand-700">
                {formatDateTime(entry.created_at)}
              </time>
              <p className="mt-1 text-sm whitespace-pre-wrap text-slate-700">{entry.body}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-sm font-bold text-brand-700">
            וישליסט {wishlist.length > 0 && `(${wishlist.length})`}
          </h2>
          <div className="ms-auto">
            <EntityPicker
              triggerLabel="שייך נכס"
              searchPlaceholder="חיפוש נכס לפי כתובת או שכונה…"
              emptyText="אין נכסים במערכת"
              pending={addInterest.isPending}
              items={available.map((p) => ({
                id: p.id,
                primary: p.address || 'ללא כתובת',
                secondary: [p.neighborhood?.name, p.city].filter(Boolean).join(', ') || null,
                trailing: (
                  <span className="shrink-0 text-xs font-bold text-brand-600">
                    {formatPrice(p.price)}
                  </span>
                ),
              }))}
              onSelect={(propertyId) => addInterest.mutate({ buyerId: buyer.id, propertyId })}
            />
          </div>
        </div>

        <p className="mb-3 text-xs text-slate-500">
          מה שמשויך כאן מופיע אוטומטית גם אצל הנכס עצמו, ברשימת המתעניינים.
        </p>

        {wishlist.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">אין נכסים משויכים.</p>
        ) : (
          <ul className="space-y-2">
            {wishlist.map((property) => (
              <li
                key={property.id}
                className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3"
              >
                <Link to={`/properties/${property.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {property.address || 'ללא כתובת'}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {[property.neighborhood?.name, property.city].filter(Boolean).join(', ') || '—'}
                  </span>
                </Link>
                <span className="shrink-0 text-sm font-bold text-brand-600">
                  {formatPrice(property.price)}
                </span>
                <button
                  type="button"
                  title="הסר מהווישליסט"
                  onClick={() =>
                    removeInterest.mutate({ buyerId: buyer.id, propertyId: property.id })
                  }
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600"
                >
                  <TrashIcon className="size-4" />
                  <span className="sr-only">הסר מהווישליסט</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {(updateBuyer.error || addUpdate.error || addInterest.error || removeInterest.error) && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {
            (updateBuyer.error ?? addUpdate.error ?? addInterest.error ?? removeInterest.error)
              ?.message
          }
        </p>
      )}
    </div>
  )
}
