import { useState, type FormEvent } from 'react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Field, Input } from './ui/Input'
import { PlusIcon } from './icons'

/**
 * הוספה מהירה של לקוח/מוכר — שם וטלפון בלבד.
 * המתווך מוסיף אנשים תוך כדי שיחה, אז אין כאן טופס מלא.
 */
export function PersonQuickAdd({
  title,
  namePlaceholder,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: {
  title: string
  namePlaceholder: string
  submitLabel: string
  submitting: boolean
  error?: string | null
  onSubmit: (values: { full_name: string; phone: string | null }) => void
}) {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    onSubmit({ full_name: fullName.trim(), phone: phone.trim() || null })
    setFullName('')
    setPhone('')
    setOpen(false)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="size-4.5" />
        {submitLabel}
      </Button>
    )
  }

  return (
    <Card className="w-full p-5">
      <h2 className="mb-4 text-sm font-bold text-brand-700">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="שם מלא">
            <Input
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={namePlaceholder}
              required
            />
          </Field>
          <Field label="טלפון">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-0000000"
              dir="ltr"
              className="text-start"
            />
          </Field>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            ביטול
          </Button>
        </div>
      </form>
    </Card>
  )
}
