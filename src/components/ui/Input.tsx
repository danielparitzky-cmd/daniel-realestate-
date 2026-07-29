import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

// text-base במובייל הוא לא החלטה עיצובית: מתחת ל-16px ספארי מזנק זום
// על כל focus בשדה, והמתווך נשאר עם מסך מוגדל באמצע מילוי טופס.
const BASE =
  'w-full rounded-xl bg-white px-3.5 py-3 text-base text-slate-800 ring-1 ring-brand-200 ' +
  'placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none ' +
  'disabled:bg-slate-50 disabled:text-slate-400 sm:py-2.5 sm:text-sm'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn(BASE, className)} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn(BASE, 'resize-y leading-relaxed', className)} />
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}
