/**
 * מוצג כל עוד .env.local לא מולא. מונע קריסה מול שרת שעדיין לא קיים.
 * ברגע שהערכים אמיתיים — המסך הזה נעלם מעצמו.
 */
export default function SetupNeeded() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-100 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-brand-200/60">
        <h1 className="text-xl font-bold text-slate-800">חיבור ל-Supabase עדיין לא הוגדר</h1>
        <p className="mt-2 text-sm text-slate-600">
          השלד של האפליקציה מוכן. כדי להפעיל אותה צריך פרויקט Supabase:
        </p>

        <ol className="mt-5 space-y-3 text-sm text-slate-700">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
              1
            </span>
            <span>
              פתח פרויקט ב-<span className="ltr-nums font-mono text-xs">supabase.com</span> (region:
              Frankfurt / eu-central-1).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
              2
            </span>
            <span>
              ב-SQL Editor הרץ את{' '}
              <span className="ltr-nums rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs">
                supabase/migrations/0001_init.sql
              </span>
              , ואז את{' '}
              <span className="ltr-nums rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs">
                supabase/verify_security.sql
              </span>{' '}
              לבדיקה.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
              3
            </span>
            <span>
              Authentication → Users → Add User — צור את משתמש ה-admin היחיד ידנית (יש לסמן
              auto-confirm).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
              4
            </span>
            <span>
              העתק את{' '}
              <span className="ltr-nums rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs">
                .env.example
              </span>{' '}
              ל-
              <span className="ltr-nums rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs">
                .env.local
              </span>{' '}
              ומלא URL + anon key. הרץ מחדש{' '}
              <span className="ltr-nums rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs">
                npm run dev
              </span>
              .
            </span>
          </li>
        </ol>

        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
          רק anon key בקליינט. לעולם לא service_role key.
        </p>
      </div>
    </div>
  )
}
