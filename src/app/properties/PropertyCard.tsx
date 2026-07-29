import { Link } from 'react-router-dom'
import { imageUrl } from '../../lib/supabaseClient'
import { formatPrice } from '../../lib/format'
import { PROPERTY_STATUS, type PropertyStatus } from '../../lib/constants'
import { Badge } from '../../components/ui/Card'
import { ImageIcon } from '../../components/icons'
import type { Property } from '../../lib/queries/properties'

export function PropertyCard({ property }: { property: Property }) {
  const status = PROPERTY_STATUS[property.status as PropertyStatus]
  const location = [property.neighborhood?.name, property.city ?? property.neighborhood?.city]
    .filter(Boolean)
    .join(', ')

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-200/60 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-300"
    >
      <div className="relative aspect-4/3 bg-brand-100">
        {property.mainImage ? (
          <img
            src={imageUrl(property.mainImage.storage_path)}
            alt={property.address ?? 'נכס'}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-brand-300">
            <ImageIcon className="size-10" />
          </div>
        )}

        {status && (
          <Badge className={`absolute end-2 top-2 ${status.chip} shadow-sm`}>{status.label}</Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="truncate font-bold text-slate-800">{property.address || 'ללא כתובת'}</p>
        <p className="mt-0.5 truncate text-sm text-slate-500">{location || '—'}</p>

        <p className="mt-3 text-xl font-bold text-brand-600">{formatPrice(property.price)}</p>

        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-brand-100 pt-3 text-xs text-slate-500">
          {property.size_sqm != null && (
            <div className="flex gap-1">
              <dt>מ״ר</dt>
              <dd className="font-semibold text-slate-700">{property.size_sqm}</dd>
            </div>
          )}
          {property.bedrooms != null && (
            <div className="flex gap-1">
              <dt>חדרי שינה</dt>
              <dd className="font-semibold text-slate-700">{property.bedrooms}</dd>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex gap-1">
              <dt>אמבטיות</dt>
              <dd className="font-semibold text-slate-700">{property.bathrooms}</dd>
            </div>
          )}
        </dl>
      </div>
    </Link>
  )
}
