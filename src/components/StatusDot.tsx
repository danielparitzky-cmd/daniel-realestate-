import { BUYER_STATUS, type BuyerStatus } from '../lib/constants'
import { Badge } from './ui/Card'

/** צבע הסטטוס של הלקוח — זהה בכל מקום שהלקוח מופיע. */
export function BuyerStatusBadge({ status }: { status: string }) {
  const s = BUYER_STATUS[status as BuyerStatus] ?? BUYER_STATUS.active
  return (
    <Badge className={s.chip}>
      <span className={`size-2 rounded-full ${s.dot}`} />
      {s.label}
    </Badge>
  )
}

export function BuyerStatusDot({ status }: { status: string }) {
  const s = BUYER_STATUS[status as BuyerStatus] ?? BUYER_STATUS.active
  return <span className={`size-2.5 shrink-0 rounded-full ${s.dot}`} title={s.label} />
}
