import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * האם .env.local מולא בערכים אמיתיים.
 * כל עוד false — האפליקציה מציגה מסך הגדרה במקום לנסות לדבר עם שרת שלא קיים.
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('YOUR-PROJECT-REF') && !anonKey.startsWith('YOUR-'),
)

// ערכי placeholder רק כדי ש-createClient לא יזרוק בזמן טעינת המודול.
// אף קריאה לא יוצאת בפועל כשה-app במצב "לא מוגדר".
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

/** URL ציבורי לתמונה ב-bucket property-images, עם טרנספורמציה לגודל המבוקש. */
export function imageUrl(storagePath: string, width = 800, quality = 70): string {
  const { data } = supabase.storage.from('property-images').getPublicUrl(storagePath, {
    transform: { width, quality, resize: 'contain' },
  })
  return data.publicUrl
}
