import { useEffect, useState } from 'react'
import { Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

/**
 * טקסט חופשי שנשמר רק כשבאמת השתנה. כפתורי השמירה מופיעים רק כשיש מה לשמור,
 * כדי שהמסך לא ייראה כמו טופס כשרק קוראים אותו.
 */
export function EditableText({
  value,
  placeholder,
  rows = 4,
  saving,
  onSave,
}: {
  value: string | null
  placeholder?: string
  rows?: number
  saving: boolean
  onSave: (next: string | null) => void
}) {
  const [draft, setDraft] = useState(value ?? '')

  // כשהערך מהשרת מתעדכן (למשל אחרי שמירה) — מיישרים את הטיוטה אליו
  useEffect(() => setDraft(value ?? ''), [value])

  const dirty = draft !== (value ?? '')

  return (
    <div>
      <Textarea
        rows={rows}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
      />
      {dirty && (
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            loading={saving}
            onClick={() => onSave(draft.trim() === '' ? null : draft)}
          >
            שמור
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDraft(value ?? '')}>
            בטל
          </Button>
        </div>
      )}
    </div>
  )
}
