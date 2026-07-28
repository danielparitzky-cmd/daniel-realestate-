import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export default function LoginPage() {
  const { session, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email.trim(), password)
    if (error) setError(error)
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-100 p-4">
      <Card className="w-full max-w-sm p-7">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
              aria-hidden
            >
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">ניהול נדל"ן</h1>
          <p className="mt-1 text-sm text-slate-500">התחברות למערכת</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="אימייל">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              dir="ltr"
              className="text-start"
              placeholder="you@example.com"
            />
          </Field>

          <Field label="סיסמה">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              dir="ltr"
              className="text-start"
            />
          </Field>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200"
            >
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={submitting} className="w-full">
            כניסה
          </Button>
        </form>
      </Card>
    </div>
  )
}
