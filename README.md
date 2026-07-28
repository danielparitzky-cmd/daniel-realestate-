# פלטפורמת ניהול למתווך נדל"ן

משתמש יחיד (המתווך). ארבעה מודולים: נכסים, לקוחות, מוכרים, לוח שנה — ולינק שיתוף ציבורי לנכס בודד.

**Stack:** React 19 + Vite + TypeScript + Tailwind v4 (Vercel) · Supabase (Postgres + Auth + Storage)

> **אין mock data.** הדאטה היחיד שנכנס למערכת הוא נכסים ולקוחות אמיתיים שהמתווך מזין דרך ה-UI.

---

## הרצה מקומית

```bash
npm install
npm run dev
```

בלי `.env.local` האפליקציה תציג מסך הגדרה עם ההוראות. זה תקין.

## חיבור ל-Supabase

1. פתח פרויקט ב-[supabase.com](https://supabase.com) — region `eu-central-1` (Frankfurt).
2. SQL Editor → הרץ את `supabase/migrations/0001_init.sql`.
3. SQL Editor → הרץ את `supabase/verify_security.sql`. **כל השורות חייבות להחזיר `ok = true`.**
4. Authentication → Users → Add User — צור את משתמש ה-admin היחיד ידנית, עם auto-confirm.
   אין route של signup באפליקציה, וזה בכוונה.
5. `cp .env.example .env.local` ומלא `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
   (Project Settings → API).

> ⚠️ רק `anon` key בקליינט. **לעולם לא** `service_role`.

## פריסה ל-Vercel

חבר את הריפו ל-Vercel והגדר את אותם שני משתני סביבה (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`). `vercel.json` כבר מגדיר SPA rewrites כדי ש-`/s/:token` יעבוד.

---

## מודל האבטחה

| שכבה | מה |
|---|---|
| `anon` | אפס הרשאות על כל טבלה ב-`public`, כולל טבלאות עתידיות (`alter default privileges`) |
| RLS | מופעל על כל טבלה, פוליסה אחת: `to authenticated` |
| דף ציבורי | קורא **רק** ל-RPC `get_shared_property(token)` — לא נוגע בטבלה |
| ה-RPC | `security definer` + `set search_path = public`. מחזיר פרטי נכס + תיאור + תמונות בלבד |
| שיתוף | `internal_notes`, מוכר ומתעניינים **לא נשלפים מה-DB** — לא "מוסתרים ב-UI" |
| טוקן | 128-bit (`gen_random_bytes(16)`), ניתן לביטול דרך `revoked_at` |
| chunks | `/s/:token` הוא chunk נפרד — מבקר בלינק לא מוריד את קוד הניהול |

## מבנה

```
src/
  lib/           supabaseClient, auth, env, constants (סטטוסים+צבעים), format
  components/ui/ Button, Input, Card, Badge, EmptyState
  app/
    AdminProviders  react-query + auth  (chunk נפרד)
    AdminLayout     RequireAuth + AppShell
    AppShell        header + סרגל טאבים
    HomeScreen      4 המלבנים
    properties/ buyers/ sellers/ calendar/
  public-share/  SharePropertyPage — מחוץ ל-auth
supabase/
  migrations/0001_init.sql   סכמה + RLS + RPC + storage
  verify_security.sql        צ'קליסט אבטחה
```

## פאזות

| פאזה | מה | סטטוס |
|---|---|---|
| 0 | יסודות: שלד, סכמה, login, 4 מלבנים | ✅ |
| 1 | נכסים — כרטיסיות, טופס, תמונות, חיפוש | ⏳ |
| 2 | לקוחות — CRM לוג, סטטוס צבעוני, וישליסט | ⏳ |
| 3 | מוכרים — שיוך נכס דו-כיווני, "צור נכס" | ⏳ |
| 4 | לוח שנה — קוביות callback אדום/ירוק | ⏳ |
| 5 | לינק שיתוף | ⏳ |
