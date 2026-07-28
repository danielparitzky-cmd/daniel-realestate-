import type { ReactElement } from 'react'
import { CalendarIcon, HomeIcon, KeyIcon, UsersIcon } from '../components/icons'

export type TabDef = {
  to: string
  label: string
  blurb: string
  Icon: (props: { className?: string }) => ReactElement
}

/** ארבעת המודולים — אותו מקור אמת למסך הראשי ולסרגל הטאבים. */
export const TABS: TabDef[] = [
  { to: '/properties', label: 'נכסים', blurb: 'כל הנכסים, תמונות ופרטים', Icon: HomeIcon },
  { to: '/buyers', label: 'לקוחות', blurb: 'קונים, עדכונים ווישליסט', Icon: UsersIcon },
  { to: '/sellers', label: 'מוכרים', blurb: 'בעלי הנכסים ופרטי קשר', Icon: KeyIcon },
  { to: '/calendar', label: 'לוח שנה', blurb: 'למי לחזור ומתי', Icon: CalendarIcon },
]
