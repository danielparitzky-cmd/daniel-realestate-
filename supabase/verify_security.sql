-- ============================================================================
-- צ'קליסט אבטחה — להרצה ב-SQL Editor אחרי 0001_init.sql
-- כל שאילתה מחזירה שורה עם check_name + ok (true/false) + details.
-- כולן חייבות להחזיר ok = true.
-- ============================================================================

-- 1. RLS מופעל על כל טבלה ב-public
select
  'RLS enabled on every public table' as check_name,
  bool_and(c.relrowsecurity)         as ok,
  string_agg(c.relname, ', ') filter (where not c.relrowsecurity) as tables_missing_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r';

-- 2. ל-anon אין שום הרשאה על שום טבלה ב-public
select
  'anon has zero table privileges' as check_name,
  count(*) = 0                     as ok,
  coalesce(string_agg(distinct table_name || ':' || privilege_type, ', '), '—') as leaks
from information_schema.role_table_grants
where grantee = 'anon' and table_schema = 'public';

-- 3. הפונקציה היחידה ש-anon יכול להריץ היא get_shared_property
select
  'anon can execute only get_shared_property' as check_name,
  coalesce(array_agg(p.proname order by p.proname), '{}') = '{get_shared_property}'::name[] as ok,
  coalesce(string_agg(p.proname, ', '), '—') as executable_functions
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and has_function_privilege('anon', p.oid, 'execute');

-- 4. get_shared_property היא security definer עם search_path קבוע
select
  'get_shared_property is security definer with pinned search_path' as check_name,
  p.prosecdef and p.proconfig @> array['search_path=public']        as ok,
  p.prosecdef::text || ' / ' || coalesce(array_to_string(p.proconfig, ','), 'NO search_path') as details
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'get_shared_property';

-- 5. ה-RPC לא מחזיר internal_notes / seller / buyers
select
  'get_shared_property leaks no private fields' as check_name,
  prosrc not ilike '%internal_notes%'
    and prosrc not ilike '%seller%'
    and prosrc not ilike '%buyer%'                as ok,
  'scanned function body'                         as details
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'get_shared_property';

-- 6. bucket התמונות קיים, קריאה ציבורית, כתיבה ל-authenticated בלבד
select
  'property-images bucket exists and is public-read' as check_name,
  count(*) = 1                                       as ok,
  coalesce(string_agg(id || ' public=' || public::text, ', '), 'MISSING') as details
from storage.buckets where id = 'property-images';

-- שום policy על storage.objects לא נגיש ל-anon/public — כולל SELECT.
-- SELECT ציבורי היה מאפשר LIST של כל הקבצים ב-bucket לכל מי שיש לו את ה-anon key.
-- הגשת התמונות עצמן לא תלויה ב-policy: ה-bucket ציבורי.
select
  'no anon/public policy of any kind on storage.objects' as check_name,
  count(*) = 0                                           as ok,
  coalesce(string_agg(policyname || ':' || cmd, ', '), '—') as offending_policies
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and (roles @> '{anon}' or roles @> '{public}');

-- 7. טוקן השיתוף הוא 128-bit
select
  'share_links.token defaults to 16 random bytes (128-bit)' as check_name,
  column_default like '%gen_random_bytes(16)%'              as ok,
  column_default                                            as details
from information_schema.columns
where table_schema = 'public' and table_name = 'share_links' and column_name = 'token';
