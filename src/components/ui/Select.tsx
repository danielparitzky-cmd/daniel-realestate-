import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={cn(
        'w-full appearance-none rounded-xl bg-white px-3.5 py-3 text-base text-slate-800',
        'ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500 focus:outline-none',
        'sm:py-2.5 sm:text-sm',
        className,
      )}
    />
  )
}
