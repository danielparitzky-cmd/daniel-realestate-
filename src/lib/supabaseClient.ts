import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

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
export const supabase = createClient<Database>(url || 'http://localhost:54321', anonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

/**
 * URL ציבורי לתמונה ב-bucket property-images.
 *
 * Supabase Image Transformation (?width=&quality=) זמין רק ב-Pro ומעלה,
 * והפרויקט על free — שם ה-render endpoint מחזיר שגיאה. לכן מגישים את הקובץ כמו שהוא.
 * זה בסדר: התמונות כבר נדחסות בדפדפן לפני ההעלאה (~300KB, עד 1600px).
 * אם תשדרג ל-Pro, החזר כאן את אופציית transform.
 */
export function imageUrl(storagePath: string): string {
  const { data } = supabase.storage.from('property-images').getPublicUrl(storagePath)
  return data.publicUrl
}
