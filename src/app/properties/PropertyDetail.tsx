import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDeleteProperty, useProperty, useUpdateProperty } from '../../lib/queries/properties'
import { formatPrice } from '../../lib/format'
import {
  PROPERTY_CONDITION,
  PROPERTY_STATUS,
  PROPERTY_TYPE,
  type PropertyCondition,
  type PropertyStatus,
  type PropertyType,
} from '../../lib/constants'
import { Badge, Card, EmptyState } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { QueryState } from '../../components/ui/QueryState'
import { ChevronIcon, TrashIcon } from '../../components/icons'
import { ImageManager } from './ImageManager'
import { EditableText } from './EditableText'
import { InterestedBuyers } from './InterestedBuyers'
import { PropertySeller } from './PropertySeller'
import { ShareLinkSection } from './ShareLinkSection'

function Spec({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div className="rounded-xl bg-brand-50 px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-bold text-slate-800">{value}</dd>
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: property, isPending, isPaused, error, refetch } = useProperty(id)
  const updateProperty = useUpdateProperty()
  const deleteProperty = useDeleteProperty()

  if (isPending || isPaused || error) {
    return (
      <QueryState
        isPending={isPending}
        isPaused={isPaused}
        error={error}
        onRetry={() => void refetch()}
      />
    )
  }

  if (!property) {
    return (
      <EmptyState
        title="הנכס לא נמצא"
        description="ייתכן שהוא נמחק."
        action={
          <Link to="/properties">
            <Button variant="secondary">חזרה לנכסים</Button>
          </Link>
        }
      />
    )
  }

  const status = PROPERTY_STATUS[property.status as PropertyStatus]
  const location = [property.neighborhood?.name, property.city ?? property.neighborhood?.city]
    .filter(Boolean)
    .join(', ')

  const save = (patch: Parameters<typeof updateProperty.mutate>[0]['patch']) =>
    updateProperty.mutate({ id: property.id, patch })

  return (
    <div className="space-y-4">
      <Link
        to="/properties"
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ChevronIcon className="size-4 rotate-180" />
        כל הנכסים
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-800">
              {property.address || 'ללא כתובת'}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">{location || '—'}</p>
            <p className="mt-3 text-2xl font-bold text-brand-600">{formatPrice(property.price)}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {status && <Badge className={status.chip}>{status.label}</Badge>}
            <div className="flex gap-2">
              <Link to={`/properties/${property.id}/edit`}>
                <Button size="sm" variant="secondary">
                  ערוך פרטים
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                loading={deleteProperty.isPending}
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (!confirm('למחוק את הנכס וכל התמונות שלו? אי אפשר לבטל.')) return
                  deleteProperty.mutate(property.id, {
                    onSuccess: () => void navigate('/properties'),
                  })
                }}
              >
                <TrashIcon className="size-4" />
                מחק
              </Button>
            </div>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Spec label="סוג" value={PROPERTY_TYPE[property.property_type as PropertyType]} />
          <Spec label="מ״ר" value={property.size_sqm} />
          <Spec label="חדרים" value={property.rooms} />
          <Spec label="חדרי שינה" value={property.bedrooms} />
          <Spec label="אמבטיות" value={property.bathrooms} />
          <Spec
            label="קומה"
            value={
              property.floor != null && property.total_floors != null
                ? `${property.floor} / ${property.total_floors}`
                : property.floor
            }
          />
          <Spec label="חניות" value={property.parking_spots || null} />
          <Spec label="שנת בנייה" value={property.build_year} />
          <Spec label="מצב" value={PROPERTY_CONDITION[property.condition as PropertyCondition]} />
          <Spec
            label="מרפסת"
            value={property.has_balcony ? (property.balcony_sqm ?? 'יש') : null}
          />
          <Spec label="מחסן" value={property.has_storage ? 'יש' : null} />
          <Spec label='ממ"ד' value={property.has_safe_room ? 'יש' : null} />
        </dl>
      </Card>

      <Card className="p-5">
        <ImageManager property={property} />
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-sm font-bold text-brand-700">תיאור חופשי</h2>
        <p className="mb-3 text-xs text-slate-500">זה החלק היחיד שנחשף בלינק השיתוף.</p>
        <EditableText
          value={property.description}
          placeholder="דירה מוארת עם נוף פתוח…"
          rows={5}
          saving={updateProperty.isPending}
          onSave={(description) => save({ description })}
        />
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-sm font-bold text-brand-700">הערות פנימיות</h2>
        <p className="mb-3 text-xs text-slate-500">לעולם לא נחשף בלינק השיתוף.</p>
        <EditableText
          value={property.internal_notes}
          placeholder="המוכר לחוץ למכור, גמיש במחיר…"
          rows={3}
          saving={updateProperty.isPending}
          onSave={(internal_notes) => save({ internal_notes })}
        />
      </Card>

      <PropertySeller propertyId={property.id} sellerId={property.seller_id} />
      <InterestedBuyers propertyId={property.id} />
      <ShareLinkSection propertyId={property.id} />

      {updateProperty.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          השמירה נכשלה: {updateProperty.error.message}
        </p>
      )}
    </div>
  )
}
