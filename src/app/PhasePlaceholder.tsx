import { EmptyState } from '../components/ui/Card'

/** מציין טאב שעדיין לא נבנה. מוחלף בקומפוננטה האמיתית בפאזה המתאימה. */
export function PhasePlaceholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold text-slate-800">{title}</h1>
      <EmptyState title={`${title} — נבנה ב${phase}`} description="השלד מוכן. התוכן ייכנס בפאזה הבאה." />
    </div>
  )
}
