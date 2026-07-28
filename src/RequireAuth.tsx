import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './lib/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-100">
        <span
          aria-label="טוען"
          className="size-8 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600"
        />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
