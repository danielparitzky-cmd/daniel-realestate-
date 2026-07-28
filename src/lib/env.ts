/**
 * בדיקת קונפיגורציה בלבד — בלי לייבא את supabase-js.
 * כך main.tsx נשאר קליל ו-supabase-js נכנס רק לצ'אנקים שבאמת צריכים אותו.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('YOUR-PROJECT-REF') && !anonKey.startsWith('YOUR-'),
)
