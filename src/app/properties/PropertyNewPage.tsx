import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateProperty } from '../../lib/queries/properties'
import { useSellers } from '../../lib/queries/sellers'
import { ChevronIcon } from '../../components/icons'
import { PropertyForm } from './PropertyForm'

export default function PropertyNewPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const createProperty = useCreateProperty()
  const { data: sellers } = useSellers()

  // מגיעים לכאן גם מתוך כרטיסיית מוכר, כשהמתווך על הקו איתו והנכס עוד לא במערכת
  const sellerId = params.get('seller_id')
  const seller = sellerId ? sellers?.find((s) => s.id === sellerId) : null

  return (
    <div className="space-y-4">
      <Link
        to={seller ? `/sellers/${seller.id}` : '/properties'}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ChevronIcon className="size-4 rotate-180" />
        {seller ? `חזרה ל${seller.full_name}` : 'כל הנכסים'}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">נכס חדש</h1>

      {seller && (
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 ring-1 ring-brand-200">
          הנכס ישויך אוטומטית ל{seller.full_name}
        </p>
      )}

      <PropertyForm
        submitLabel="צור נכס"
        submitting={createProperty.isPending}
        error={createProperty.error?.message}
        onCancel={() => void navigate(seller ? `/sellers/${seller.id}` : '/properties')}
        onSubmit={(values) =>
          createProperty.mutate(
            { ...values, seller_id: sellerId },
            // ישר לכרטיסייה, כדי שאפשר יהיה להעלות תמונות בלי צעד נוסף
            { onSuccess: (created) => void navigate(`/properties/${created.id}`) },
          )
        }
      />
    </div>
  )
}
