import { Link } from 'react-router-dom'
import { ChevronIcon } from '../components/icons'
import { TABS } from './tabs'

export default function HomeScreen() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">שלום</h1>
      <p className="mb-6 text-sm text-slate-500">לאן נכנסים?</p>

      <div className="flex flex-col gap-3">
        {TABS.map(({ to, label, blurb, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-200/60 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-300"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
              <Icon className="size-6" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-slate-800">{label}</span>
              <span className="block truncate text-sm text-slate-500">{blurb}</span>
            </span>

            <ChevronIcon className="size-5 shrink-0 text-brand-300 transition-transform group-hover:-translate-x-0.5 group-hover:text-brand-500" />
          </Link>
        ))}
      </div>
    </div>
  )
}
