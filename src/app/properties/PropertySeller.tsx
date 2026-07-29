import { Link } from 'react-router-dom'
import { useSellers, useSetPropertySeller } from '../../lib/queries/sellers'
import { Card } from '../../components/ui/Card'
import { EntityPicker } from '../../components/EntityPicker'
import { TrashIcon } from '../../components/icons'

/**
 * מוכר יחיד לנכס — seller_id הוא עמודה בודדת, לא M2M.
 * בחירת מוכר אחר פשוט מחליפה את הקודם.
 */
export function PropertySeller({
  propertyId,
  sellerId,
}: {
  propertyId: string
  sellerId: string | null
}) {
  const { data: sellers } = useSellers()
  const setPropertySeller = useSetPropertySeller()

  const seller = sellers?.find((s) => s.id === sellerId) ?? null
  const others = (sellers ?? []).filter((s) => s.id !== sellerId)

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-bold text-brand-700">מוכר</h2>
        <div className="ms-auto">
          <EntityPicker
            triggerLabel={seller ? 'החלף מוכר' : 'שייך מוכר'}
            searchPlaceholder="חיפוש מוכר לפי שם או טלפון…"
            emptyText="אין מוכרים במערכת"
            pending={setPropertySeller.isPending}
            items={others.map((s) => ({ id: s.id, primary: s.full_name, secondary: s.phone }))}
            onSelect={(id) => setPropertySeller.mutate({ propertyId, sellerId: id })}
          />
        </div>
      </div>

      <p className="mb-3 text-xs text-slate-500">
        מוכר אחד לנכס. לא נחשף בלינק השיתוף.
      </p>

      {!seller ? (
        <p className="py-4 text-center text-sm text-slate-400">אין מוכר משויך.</p>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
          <Link to={`/sellers/${seller.id}`} className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-800">
              {seller.full_name}
            </span>
            <span className="ltr-nums block truncate text-xs text-slate-500">
              {seller.phone || '—'}
            </span>
          </Link>
          <button
            type="button"
            title="בטל שיוך"
            onClick={() => setPropertySeller.mutate({ propertyId, sellerId: null })}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600"
          >
            <TrashIcon className="size-4" />
            <span className="sr-only">בטל שיוך</span>
          </button>
        </div>
      )}

      {setPropertySeller.error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {setPropertySeller.error.message}
        </p>
      )}
    </Card>
  )
}
