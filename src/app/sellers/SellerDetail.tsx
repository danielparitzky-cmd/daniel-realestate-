import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useDeleteSeller,
  useSeller,
  useSellers,
  useSetPropertySeller,
  useUpdateSeller,
} from '../../lib/queries/sellers'
import { useProperties } from '../../lib/queries/properties'
import { formatPrice } from '../../lib/format'
import { Card, EmptyState } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { QueryState } from '../../components/ui/QueryState'
import { EntityPicker } from '../../components/EntityPicker'
import { PlusIcon, TrashIcon } from '../../components/icons'
import { BackLink } from '../../components/BackLink'
import { EditableText } from '../properties/EditableText'

export default function SellerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: seller, isPending, isPaused, error, refetch } = useSeller(id)
  const { data: sellers } = useSellers()
  const { data: properties } = useProperties()

  const updateSeller = useUpdateSeller()
  const deleteSeller = useDeleteSeller()
  const setPropertySeller = useSetPropertySeller()

  const sellerNames = useMemo(
    () => new Map((sellers ?? []).map((s) => [s.id, s.full_name])),
    [sellers],
  )

  const owned = useMemo(() => (properties ?? []).filter((p) => p.seller_id === id), [properties, id])

  const available = useMemo(
    () => (properties ?? []).filter((p) => p.seller_id !== id),
    [properties, id],
  )

  if (!seller && (isPending || isPaused || error)) {
    return (
      <QueryState
        isPending={isPending}
        isPaused={isPaused}
        error={error}
        onRetry={() => void refetch()}
      />
    )
  }

  if (!seller) {
    return (
      <EmptyState
        title="המוכר לא נמצא"
        action={
          <Link to="/sellers">
            <Button variant="secondary">חזרה למוכרים</Button>
          </Link>
        }
      />
    )
  }

  const save = (patch: Parameters<typeof updateSeller.mutate>[0]['patch']) =>
    updateSeller.mutate({ id: seller.id, patch })

  return (
    <div className="space-y-4">
      <BackLink to="/sellers">כל המוכרים</BackLink>

      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <input
              defaultValue={seller.full_name}
              onBlur={(e) => {
                const next = e.target.value.trim()
                if (next && next !== seller.full_name) save({ full_name: next })
              }}
              className="w-full rounded-lg border-0 bg-transparent px-0 text-2xl font-bold text-slate-800 focus:bg-brand-50 focus:px-2 focus:outline-none"
            />
            <input
              type="tel"
              dir="ltr"
              defaultValue={seller.phone ?? ''}
              placeholder="050-0000000"
              onBlur={(e) => {
                const next = e.target.value.trim() || null
                if (next !== seller.phone) save({ phone: next })
              }}
              className="ltr-nums mt-1 w-full rounded-lg border-0 bg-transparent px-0 text-start text-base text-slate-500 focus:bg-brand-50 focus:px-2 focus:outline-none sm:text-sm"
            />
          </div>

          <Button
            size="sm"
            variant="ghost"
            loading={deleteSeller.isPending}
            className="text-red-600 hover:bg-red-50"
            onClick={() => {
              const suffix =
                owned.length > 0 ? ` הנכסים המשויכים אליו (${owned.length}) יישארו בלי מוכר.` : ''
              if (!confirm(`למחוק את ${seller.full_name}?${suffix}`)) return
              deleteSeller.mutate(seller.id, { onSuccess: () => void navigate('/sellers') })
            }}
          >
            <TrashIcon className="size-4" />
            מחק
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-bold text-brand-700">הערות</h2>
        <EditableText
          value={seller.notes}
          placeholder="פרטים על המוכר, זמינות, ציפיות מחיר…"
          rows={3}
          saving={updateSeller.isPending}
          onSave={(notes) => save({ notes })}
        />
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-brand-700">
            נכסים {owned.length > 0 && `(${owned.length})`}
          </h2>
          <div className="ms-auto flex flex-wrap gap-2">
            {/* המוכר לפעמים על הקו לפני שהנכס בכלל במערכת */}
            <Button size="sm" onClick={() => void navigate(`/properties/new?seller_id=${seller.id}`)}>
              <PlusIcon className="size-4" />
              צור נכס
            </Button>
            <EntityPicker
              triggerLabel="שייך נכס קיים"
              searchPlaceholder="חיפוש נכס לפי כתובת או שכונה…"
              emptyText="אין נכסים במערכת"
              pending={setPropertySeller.isPending}
              items={available.map((p) => {
                const currentSeller = p.seller_id ? sellerNames.get(p.seller_id) : null
                return {
                  id: p.id,
                  primary: p.address || 'ללא כתובת',
                  secondary: currentSeller
                    ? `כרגע משויך ל${currentSeller} — השיוך יוחלף`
                    : [p.neighborhood?.name, p.city].filter(Boolean).join(', ') || null,
                  trailing: (
                    <span className="shrink-0 text-xs font-bold text-brand-600">
                      {formatPrice(p.price)}
                    </span>
                  ),
                }
              })}
              onSelect={(propertyId) => setPropertySeller.mutate({ propertyId, sellerId: seller.id })}
            />
          </div>
        </div>

        <p className="mb-3 text-xs text-slate-500">
          לנכס יכול להיות מוכר אחד בלבד. שיוך נכס שכבר יש לו מוכר מחליף את הקודם.
        </p>

        {owned.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">אין נכסים משויכים.</p>
        ) : (
          <ul className="space-y-2">
            {owned.map((property) => (
              <li
                key={property.id}
                className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3"
              >
                <Link to={`/properties/${property.id}`} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center">
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
                <IconButton
                  label="בטל שיוך"
                  tone="danger"
                  onClick={() => setPropertySeller.mutate({ propertyId: property.id, sellerId: null })}
                >
                  <TrashIcon className="size-4.5" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {(updateSeller.error || setPropertySeller.error || deleteSeller.error) && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {(updateSeller.error ?? setPropertySeller.error ?? deleteSeller.error)?.message}
        </p>
      )}
    </div>
  )
}
