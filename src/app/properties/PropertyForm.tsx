import { useState, type FormEvent, type ReactNode } from 'react'
import { Field, Input, Textarea } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  PROPERTY_CONDITION,
  PROPERTY_STATUS,
  PROPERTY_TYPE,
} from '../../lib/constants'
import type { TablesInsert } from '../../lib/database.types'
import type { Property } from '../../lib/queries/properties'
import { NeighborhoodPicker } from './NeighborhoodPicker'

type FormValues = {
  address: string
  city: string
  neighborhood_id: string | null
  price: string
  property_type: string
  rooms: string
  bedrooms: string
  bathrooms: string
  floor: string
  total_floors: string
  size_sqm: string
  has_balcony: boolean
  balcony_sqm: string
  parking_spots: string
  has_storage: boolean
  has_safe_room: boolean
  build_year: string
  condition: string
  status: string
  description: string
  internal_notes: string
}

function toFormValues(property?: Property): FormValues {
  const s = (v: string | number | null | undefined) => (v == null ? '' : String(v))
  return {
    address: s(property?.address),
    city: s(property?.city ?? property?.neighborhood?.city),
    neighborhood_id: property?.neighborhood_id ?? null,
    price: s(property?.price),
    property_type: s(property?.property_type),
    rooms: s(property?.rooms),
    bedrooms: s(property?.bedrooms),
    bathrooms: s(property?.bathrooms),
    floor: s(property?.floor),
    total_floors: s(property?.total_floors),
    size_sqm: s(property?.size_sqm),
    has_balcony: property?.has_balcony ?? false,
    balcony_sqm: s(property?.balcony_sqm),
    parking_spots: s(property?.parking_spots ?? 0),
    has_storage: property?.has_storage ?? false,
    has_safe_room: property?.has_safe_room ?? false,
    build_year: s(property?.build_year),
    condition: s(property?.condition),
    status: property?.status ?? 'available',
    description: s(property?.description),
    internal_notes: s(property?.internal_notes),
  }
}

/** '' → null, אחרת מספר. שדות ריקים נשמרים כ-null ולא כ-0. */
const num = (v: string): number | null => (v.trim() === '' ? null : Number(v))
const text = (v: string): string | null => (v.trim() === '' ? null : v.trim())

function toInsert(v: FormValues): TablesInsert<'properties'> {
  return {
    address: text(v.address),
    city: text(v.city),
    neighborhood_id: v.neighborhood_id,
    price: num(v.price),
    property_type: text(v.property_type),
    rooms: num(v.rooms),
    bedrooms: num(v.bedrooms),
    bathrooms: num(v.bathrooms),
    floor: num(v.floor),
    total_floors: num(v.total_floors),
    size_sqm: num(v.size_sqm),
    has_balcony: v.has_balcony,
    // מרפסת שנוקתה מסומנת null ולא נשארת עם המ״ר של לפני
    balcony_sqm: v.has_balcony ? num(v.balcony_sqm) : null,
    parking_spots: num(v.parking_spots) ?? 0,
    has_storage: v.has_storage,
    has_safe_room: v.has_safe_room,
    build_year: num(v.build_year),
    condition: text(v.condition),
    status: v.status,
    description: text(v.description),
    internal_notes: text(v.internal_notes),
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-bold text-brand-700">{title}</h2>
      {children}
    </Card>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-brand-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-brand-500"
      />
      {label}
    </label>
  )
}

export function PropertyForm({
  property,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  property?: Property
  submitLabel: string
  submitting: boolean
  error?: string | null
  onSubmit: (values: TablesInsert<'properties'>) => void
  onCancel: () => void
}) {
  const [v, setV] = useState<FormValues>(() => toFormValues(property))
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(toInsert(v))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="מיקום">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="כתובת">
            <Input
              value={v.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="רחוב ומספר"
            />
          </Field>
          <Field label="עיר">
            <Input
              value={v.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="לדוגמה: תל אביב"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="שכונה" hint="בחר מהרשימה, או הקלד שם חדש כדי ליצור אותה">
              <NeighborhoodPicker
                city={v.city}
                value={v.neighborhood_id}
                onChange={(id) => set('neighborhood_id', id)}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="מחיר וסוג">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="מחיר (₪)">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={v.price}
              onChange={(e) => set('price', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="סוג נכס">
            <Select value={v.property_type} onChange={(e) => set('property_type', e.target.value)}>
              <option value="">—</option>
              {Object.entries(PROPERTY_TYPE).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="סטטוס">
            <Select value={v.status} onChange={(e) => set('status', e.target.value)}>
              {Object.entries(PROPERTY_STATUS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="גודל וחלוקה">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="מ״ר">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={v.size_sqm}
              onChange={(e) => set('size_sqm', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="חדרים">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={v.rooms}
              onChange={(e) => set('rooms', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="חדרי שינה">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={v.bedrooms}
              onChange={(e) => set('bedrooms', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="אמבטיות">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={v.bathrooms}
              onChange={(e) => set('bathrooms', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="קומה">
            <Input
              type="number"
              inputMode="numeric"
              value={v.floor}
              onChange={(e) => set('floor', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="מתוך קומות">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={v.total_floors}
              onChange={(e) => set('total_floors', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
        </div>
      </Section>

      <Section title="תוספות">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="חניות">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={v.parking_spots}
              onChange={(e) => set('parking_spots', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="שנת בנייה">
            <Input
              type="number"
              inputMode="numeric"
              min={1800}
              max={2100}
              value={v.build_year}
              onChange={(e) => set('build_year', e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="מצב">
            <Select value={v.condition} onChange={(e) => set('condition', e.target.value)}>
              <option value="">—</option>
              {Object.entries(PROPERTY_CONDITION).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Checkbox
            label="מרפסת"
            checked={v.has_balcony}
            onChange={(next) => set('has_balcony', next)}
          />
          <Checkbox
            label="מחסן"
            checked={v.has_storage}
            onChange={(next) => set('has_storage', next)}
          />
          <Checkbox
            label='ממ"ד'
            checked={v.has_safe_room}
            onChange={(next) => set('has_safe_room', next)}
          />
        </div>

        {v.has_balcony && (
          <div className="mt-4 sm:max-w-3xs">
            <Field label="מ״ר מרפסת">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={v.balcony_sqm}
                onChange={(e) => set('balcony_sqm', e.target.value)}
                dir="ltr"
                className="text-start"
              />
            </Field>
          </div>
        )}
      </Section>

      <Section title="תיאור">
        <div className="space-y-4">
          <Field label="תיאור חופשי" hint="זה מה שנחשף בלינק השיתוף ללקוחות">
            <Textarea
              rows={5}
              value={v.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="דירה מוארת עם נוף פתוח…"
            />
          </Field>

          <Field label="הערות פנימיות" hint="לעולם לא נחשף בלינק השיתוף">
            <Textarea
              rows={3}
              value={v.internal_notes}
              onChange={(e) => set('internal_notes', e.target.value)}
              placeholder="המוכר לחוץ למכור, גמיש במחיר…"
            />
          </Field>
        </div>
      </Section>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
        >
          {error}
        </p>
      )}

      <div className="sticky bottom-0 flex gap-3 border-t border-brand-200/70 bg-brand-100/90 py-3 backdrop-blur">
        <Button type="submit" size="lg" loading={submitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </form>
  )
}
