import { RequireAuth } from '../RequireAuth'
import AppShell from './AppShell'

/** שומר האימות + השלד. כל מה שמתחתיו דורש משתמש מחובר. */
export default function AdminLayout() {
  return (
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  )
}
