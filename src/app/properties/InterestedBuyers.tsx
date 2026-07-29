import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBuyers } from '../../lib/queries/buyers'
import { useAddInterest, useInterests, useRemoveInterest } from '../../lib/queries/interest'
import { Card } from '../../components/ui/Card'
import { IconButton } from '../../components/ui/IconButton'
import { EntityPicker } from '../../components/EntityPicker'
import { BuyerStatusBadge, BuyerStatusDot } from '../../components/StatusDot'
import { TrashIcon } from '../../components/icons'

/**
 * הצד השני של אותה טבלה שמזינה את הווישליסט של הלקוח.
 * הוספה כאן מופיעה מיד אצל הלקוח, כי זו אותה שורה.
 */
export function InterestedBuyers({ propertyId }: { propertyId: string }) {
  const { data: buyers } = useBuyers()
  const { data: interests } = useInterests()
  const addInterest = useAddInterest()
  const removeInterest = useRemoveInterest()

  const interested = useMemo(() => {
    if (!buyers || !interests) return []
    const linked = new Set(
      interests.filter((row) => row.property_id === propertyId).map((row) => row.buyer_id),
    )
    return buyers.filter((b) => linked.has(b.id))
  }, [buyers, interests, propertyId])

  const available = useMemo(() => {
    const linked = new Set(interested.map((b) => b.id))
    return (buyers ?? []).filter((b) => !linked.has(b.id))
  }, [buyers, interested])

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-bold text-brand-700">
          לקוחות מתעניינים {interested.length > 0 && `(${interested.length})`}
        </h2>
        <div className="ms-auto">
          <EntityPicker
            triggerLabel="שייך לקוח"
            searchPlaceholder="חיפוש לקוח לפי שם או טלפון…"
            emptyText="אין לקוחות במערכת"
            pending={addInterest.isPending}
            items={available.map((b) => ({
              id: b.id,
              primary: b.full_name,
              secondary: b.phone,
              trailing: <BuyerStatusDot status={b.status} />,
            }))}
            onSelect={(buyerId) => addInterest.mutate({ buyerId, propertyId })}
          />
        </div>
      </div>

      <p className="mb-3 text-xs text-slate-500">
        מי שמשויך כאן מקבל את הנכס אוטומטית לווישליסט שלו. לא נחשף בלינק השיתוף.
      </p>

      {interested.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">אין לקוחות משויכים.</p>
      ) : (
        <ul className="space-y-2">
          {interested.map((buyer) => (
            <li key={buyer.id} className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
              <Link to={`/buyers/${buyer.id}`} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {buyer.full_name}
                </span>
                <span className="ltr-nums block truncate text-xs text-slate-500">
                  {buyer.phone || '—'}
                </span>
              </Link>
              <BuyerStatusBadge status={buyer.status} />
              <IconButton
                label="הסר מהמתעניינים"
                tone="danger"
                onClick={() => removeInterest.mutate({ buyerId: buyer.id, propertyId })}
              >
                <TrashIcon className="size-4.5" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      {(addInterest.error || removeInterest.error) && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {(addInterest.error ?? removeInterest.error)?.message}
        </p>
      )}
    </Card>
  )
}
