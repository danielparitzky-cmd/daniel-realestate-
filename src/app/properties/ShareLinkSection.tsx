import { useState } from 'react'
import {
  shareUrl,
  useCreateShareLink,
  useRevokeShareLink,
  useShareLinks,
} from '../../lib/queries/shareLinks'
import { formatDate } from '../../lib/format'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PlusIcon } from '../../components/icons'

export function ShareLinkSection({ propertyId }: { propertyId: string }) {
  const { data: links } = useShareLinks(propertyId)
  const createLink = useCreateShareLink()
  const revokeLink = useRevokeShareLink()
  const [copied, setCopied] = useState<string | null>(null)

  const active = (links ?? []).filter((l) => !l.revoked_at)
  const revoked = (links ?? []).filter((l) => l.revoked_at)

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(shareUrl(token))
      setCopied(token)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // clipboard חסום (בדרך כלל בלי https) — הלינק גלוי ממילא לבחירה ידנית
      setCopied(null)
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-bold text-brand-700">לינק שיתוף</h2>
        <Button
          size="sm"
          variant="secondary"
          className="ms-auto"
          loading={createLink.isPending}
          onClick={() => createLink.mutate(propertyId)}
        >
          <PlusIcon className="size-4" />
          צור לינק
        </Button>
      </div>

      <p className="mb-3 text-xs text-slate-500">
        צפייה בלבד. הלינק מראה רק את פרטי הנכס, התמונות והתיאור החופשי — בלי הערות פנימיות, בלי
        המוכר ובלי המתעניינים.
      </p>

      {active.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">אין לינק פעיל.</p>
      ) : (
        <ul className="space-y-2">
          {active.map((link) => (
            <li key={link.id} className="rounded-xl bg-brand-50 px-4 py-3">
              <p className="ltr-nums mb-2 truncate font-mono text-xs text-slate-600" dir="ltr">
                {shareUrl(link.token)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => void copy(link.token)}>
                  {copied === link.token ? 'הועתק ✓' : 'העתק'}
                </Button>
                <a href={`/s/${link.token}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="secondary">
                    פתח
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  loading={revokeLink.isPending}
                  onClick={() => {
                    if (!confirm('לבטל את הלינק? מי שיפתח אותו לא יראה כלום.')) return
                    revokeLink.mutate({ id: link.id, propertyId })
                  }}
                >
                  בטל
                </Button>
                <span className="ms-auto text-xs text-slate-400">
                  נוצר {formatDate(link.created_at)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {revoked.length > 0 && (
        <p className="mt-3 text-xs text-slate-400">
          {revoked.length} לינקים בוטלו בעבר ואינם פעילים.
        </p>
      )}

      {(createLink.error || revokeLink.error) && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {(createLink.error ?? revokeLink.error)?.message}
        </p>
      )}
    </Card>
  )
}
