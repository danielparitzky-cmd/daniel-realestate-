import { useParams } from 'react-router-dom'

/**
 * דף ציבורי, מחוץ ל-auth guard, chunk נפרד.
 * ייבנה במלואו בפאזה 5 מול ה-RPC get_shared_property.
 * לעולם לא שולח שאילתה ישירה לטבלה.
 */
export default function SharePropertyPage() {
  const { token } = useParams<{ token: string }>()

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-brand-200/60">
        <p className="text-lg font-bold text-slate-800">דף שיתוף נכס</p>
        <p className="mt-2 text-sm text-slate-500">נבנה בפאזה 5.</p>
        <p className="ltr-nums mt-4 rounded-lg bg-brand-50 px-3 py-2 font-mono text-xs text-slate-500">
          {token}
        </p>
      </div>
    </div>
  )
}
