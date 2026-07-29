import { Link, useNavigate } from 'react-router-dom'
import { useCreateProperty } from '../../lib/queries/properties'
import { ChevronIcon } from '../../components/icons'
import { PropertyForm } from './PropertyForm'

export default function PropertyNewPage() {
  const navigate = useNavigate()
  const createProperty = useCreateProperty()

  return (
    <div className="space-y-4">
      <Link
        to="/properties"
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ChevronIcon className="size-4 rotate-180" />
        כל הנכסים
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">נכס חדש</h1>

      <PropertyForm
        submitLabel="צור נכס"
        submitting={createProperty.isPending}
        error={createProperty.error?.message}
        onCancel={() => void navigate('/properties')}
        onSubmit={(values) =>
          createProperty.mutate(values, {
            // ישר לכרטיסייה, כדי שאפשר יהיה להעלות תמונות בלי צעד נוסף
            onSuccess: (created) => void navigate(`/properties/${created.id}`),
          })
        }
      />
    </div>
  )
}
