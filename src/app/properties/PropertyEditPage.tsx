import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProperty, useUpdateProperty } from '../../lib/queries/properties'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/QueryState'
import { ChevronIcon } from '../../components/icons'
import { PropertyForm } from './PropertyForm'

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: property, isPending, isPaused, error, refetch } = useProperty(id)
  const updateProperty = useUpdateProperty()

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
        action={
          <Link to="/properties">
            <Button variant="secondary">חזרה לנכסים</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <Link
        to={`/properties/${property.id}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ChevronIcon className="size-4 rotate-180" />
        חזרה לנכס
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">עריכת נכס</h1>

      <PropertyForm
        property={property}
        submitLabel="שמור שינויים"
        submitting={updateProperty.isPending}
        error={updateProperty.error?.message}
        onCancel={() => void navigate(`/properties/${property.id}`)}
        onSubmit={(values) =>
          updateProperty.mutate(
            { id: property.id, patch: values },
            { onSuccess: () => void navigate(`/properties/${property.id}`) },
          )
        }
      />
    </div>
  )
}
