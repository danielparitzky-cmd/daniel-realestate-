import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProperties } from '../../lib/queries/properties'
import { SearchBox } from '../../components/SearchBox'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/QueryState'
import { PlusIcon } from '../../components/icons'
import { PropertyCard } from './PropertyCard'

export default function PropertiesTab() {
  const { data: properties, isPending, isPaused, error, refetch } = useProperties()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!properties) return []
    const q = search.trim().toLowerCase()
    if (!q) return properties

    // חיפוש לפי שכונה או עיר — הכתובת נכללת כי היא מה שהמתווך זוכר בפועל
    return properties.filter((p) =>
      [p.neighborhood?.name, p.city, p.neighborhood?.city, p.address]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    )
  }, [properties, search])

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800">נכסים</h1>
        {properties && properties.length > 0 && (
          <span className="rounded-full bg-brand-200/50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            {filtered.length}
            {filtered.length !== properties.length && ` מתוך ${properties.length}`}
          </span>
        )}
        <Link to="/properties/new" className="ms-auto">
          <Button>
            <PlusIcon className="size-4.5" />
            צור נכס
          </Button>
        </Link>
      </div>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="חיפוש לפי שכונה, עיר או כתובת…"
        className="mb-5"
      />

      <QueryState
        isPending={isPending}
        isPaused={isPaused}
        error={error}
        hasData={properties != null}
        onRetry={() => void refetch()}
        loadingLabel="טוען נכסים…"
      />

      {properties && properties.length === 0 && (
        <EmptyState
          title="אין עדיין נכסים"
          description="הוסף את הנכס הראשון וכל הפרטים שלו יופיעו כאן ככרטיסייה."
          action={
            <Link to="/properties/new">
              <Button>
                <PlusIcon className="size-4.5" />
                צור נכס
              </Button>
            </Link>
          }
        />
      )}

      {properties && properties.length > 0 && filtered.length === 0 && (
        <EmptyState title="אין נכס שמתאים לחיפוש" description={`לא נמצאה התאמה ל"${search}".`} />
      )}

      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
