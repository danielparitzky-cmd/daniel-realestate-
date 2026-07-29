import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../lib/auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
      // React Query משהה בקשות לפי navigator.onLine, שהוא יוריסטיקה לא אמינה —
      // הוא משקר בפורטלים שבויים, ואם הדפדפן נחשב אופליין בזמן הטעינה ואירוע
      // 'online' לא נורה אחר כך, השאילתה נתקעת ב-paused לנצח. ('offlineFirst'
      // לא פותר: הוא שולח את הבקשה הראשונה אבל משהה את ה-retry, אז המשתמש
      // תקוע ב-pending ולא רואה את השגיאה האמיתית.)
      // 'always' מתעלם מהדגל ומנסה באמת. כישלון רשת מגיע כשגיאה עם "נסה שוב",
      // וזה גם מה שמתווך בשטח צריך לראות במקום ספינר אינסופי.
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
})

/**
 * הספקים של אפליקציית הניהול. נטען כ-chunk נפרד, כך שדף השיתוף הציבורי
 * לא מוריד auth / react-query / קוד ניהול.
 */
export default function AdminProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  )
}
