import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { imageUrl, supabase } from '../lib/supabaseClient'
import { formatPrice } from '../lib/format'
import {
  PROPERTY_CONDITION,
  PROPERTY_TYPE,
  type PropertyCondition,
  type PropertyType,
} from '../lib/constants'

/**
 * דף ציבורי, מחוץ ל-auth guard, chunk נפרד.
 *
 * לא נוגע בשום טבלה. הגישה היחידה שלו היא ה-RPC get_shared_property, שרץ
 * security definer ומחזיר אך ורק פרטי נכס + תיאור + תמונות. הערות פנימיות,
 * המוכר והמתעניינים לא נשלפים מה-DB בכלל — הם לא "מוסתרים כאן".
 */
type SharedProperty = {
  address: string | null
  city: string | null
  price: number | null
  property_type: string | null
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  floor: number | null
  total_floors: number | null
  size_sqm: number | null
  has_balcony: boolean
  balcony_sqm: number | null
  parking_spots: number
  has_storage: boolean
  has_safe_room: boolean
  build_year: number | null
  condition: string | null
  description: string | null
  neighborhood: string | null
  images: string[]
  error?: string
}

function Spec({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div className="rounded-xl bg-brand-50 px-3 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-bold text-slate-800">{value}</dd>
    </div>
  )
}

export default function SharePropertyPage() {
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'ok'; data: SharedProperty } | { status: 'invalid' }
  >({ status: 'loading' })

  useEffect(() => {
    let active = true
    if (!token) {
      setState({ status: 'invalid' })
      return
    }

    supabase
      .rpc('get_shared_property', { p_token: token })
      .then(({ data, error }) => {
        if (!active) return
        const result = data as SharedProperty | null
        if (error || !result || result.error) setState({ status: 'invalid' })
        else setState({ status: 'ok', data: result })
      })

    return () => {
      active = false
    }
  }, [token])

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-100">
        <span
          aria-label="טוען"
          className="size-8 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600"
        />
      </div>
    )
  }

  if (state.status === 'invalid') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-brand-200/60">
          <p className="text-lg font-bold text-slate-800">הלינק אינו זמין</p>
          <p className="mt-2 text-sm text-slate-500">
            ייתכן שהוא בוטל או שהכתובת שגויה. פנה למתווך לקבלת לינק מעודכן.
          </p>
        </div>
      </div>
    )
  }

  const p = state.data
  const location = [p.neighborhood, p.city].filter(Boolean).join(', ')

  return (
    <div className="min-h-dvh bg-brand-100 pb-10">
      <div className="mx-auto max-w-2xl px-4 pt-6">
        {p.images.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-200/60">
            <img
              src={imageUrl(p.images[0])}
              alt={p.address ?? 'נכס'}
              className="aspect-4/3 w-full object-cover"
            />
            {p.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-2">
                {p.images.slice(1).map((path) => (
                  <img
                    key={path}
                    src={imageUrl(path)}
                    alt=""
                    loading="lazy"
                    className="aspect-4/3 w-28 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-200/60">
          <h1 className="text-2xl font-bold text-slate-800">{p.address || 'נכס להשקעה'}</h1>
          {location && <p className="mt-0.5 text-sm text-slate-500">{location}</p>}
          <p className="mt-4 text-3xl font-bold text-brand-600">{formatPrice(p.price)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Spec label="סוג" value={PROPERTY_TYPE[p.property_type as PropertyType]} />
            <Spec label="מ״ר" value={p.size_sqm} />
            <Spec label="חדרים" value={p.rooms} />
            <Spec label="חדרי שינה" value={p.bedrooms} />
            <Spec label="אמבטיות" value={p.bathrooms} />
            <Spec
              label="קומה"
              value={
                p.floor != null && p.total_floors != null
                  ? `${p.floor} / ${p.total_floors}`
                  : p.floor
              }
            />
            <Spec label="חניות" value={p.parking_spots || null} />
            <Spec label="שנת בנייה" value={p.build_year} />
            <Spec label="מצב" value={PROPERTY_CONDITION[p.condition as PropertyCondition]} />
            <Spec label="מרפסת" value={p.has_balcony ? (p.balcony_sqm ?? 'יש') : null} />
            <Spec label="מחסן" value={p.has_storage ? 'יש' : null} />
            <Spec label='ממ"ד' value={p.has_safe_room ? 'יש' : null} />
          </dl>

          {p.description && (
            <div className="mt-6 border-t border-brand-100 pt-5">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                {p.description}
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">צפייה בלבד</p>
      </div>
    </div>
  )
}
