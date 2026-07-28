import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../lib/auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
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
