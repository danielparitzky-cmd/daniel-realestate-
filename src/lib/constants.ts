/** סטטוס לקוח — הצבע חל בכל מקום שהלקוח מופיע (רשימה, מתעניינים בנכס, לוח שנה). */
export const BUYER_STATUS = {
  inactive: { label: 'לא פעיל', dot: 'bg-gray-400', chip: 'bg-gray-100 text-gray-700 ring-gray-300' },
  active: { label: 'פעיל', dot: 'bg-green-400', chip: 'bg-green-50 text-green-800 ring-green-300' },
  in_closing: { label: 'בתהליך סגירה', dot: 'bg-yellow-400', chip: 'bg-yellow-50 text-yellow-800 ring-yellow-300' },
  closed: { label: 'נסגר / נמכר', dot: 'bg-purple-400', chip: 'bg-purple-50 text-purple-800 ring-purple-300' },
} as const

export type BuyerStatus = keyof typeof BUYER_STATUS

export const PROPERTY_STATUS = {
  available: { label: 'זמין', chip: 'bg-green-50 text-green-800 ring-green-300' },
  in_negotiation: { label: 'במשא ומתן', chip: 'bg-yellow-50 text-yellow-800 ring-yellow-300' },
  sold: { label: 'נמכר', chip: 'bg-purple-50 text-purple-800 ring-purple-300' },
  removed: { label: 'הוסר', chip: 'bg-gray-100 text-gray-600 ring-gray-300' },
} as const

export type PropertyStatus = keyof typeof PROPERTY_STATUS

export const PROPERTY_TYPE = {
  apartment: 'דירה',
  penthouse: 'פנטהאוז',
  house: 'בית פרטי',
  duplex: 'דופלקס',
  garden_apartment: 'דירת גן',
  other: 'אחר',
} as const

export type PropertyType = keyof typeof PROPERTY_TYPE

export const PROPERTY_CONDITION = {
  new: 'חדש מקבלן',
  renovated: 'משופץ',
  good: 'במצב טוב',
  needs_renovation: 'דרוש שיפוץ',
} as const

export type PropertyCondition = keyof typeof PROPERTY_CONDITION
