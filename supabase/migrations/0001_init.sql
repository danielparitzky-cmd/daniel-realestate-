-- ============================================================================
-- פלטפורמת ניהול למתווך נדל"ן — מיגרציית בסיס
-- להרצה ב-Supabase SQL Editor (או supabase db push) על פרויקט נקי.
--
-- עקרון: משתמש admin יחיד. ל-anon אין שום גישה לטבלאות — רק ל-RPC אחד
-- (get_shared_property) שמשמש את דף השיתוף הציבורי.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. טבלאות
-- ============================================================================

-- neighborhoods — reference סגור, נוצר inline מהטופס
create table neighborhoods (
  id          uuid primary key default gen_random_uuid(),
  city        text not null,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (city, name)
);

-- sellers (מוכרים) — לפני properties בגלל ה-FK
create table sellers (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- properties (נכסים)
create table properties (
  id                uuid primary key default gen_random_uuid(),
  neighborhood_id   uuid references neighborhoods(id),
  address           text,
  city              text,
  price             numeric(12,2),
  property_type     text check (property_type in
                       ('apartment','penthouse','house','duplex','garden_apartment','other')),
  rooms             numeric(3,1),
  bedrooms          integer,
  bathrooms         integer,
  floor             integer,
  total_floors      integer,
  size_sqm          numeric,
  has_balcony       boolean not null default false,
  balcony_sqm       numeric,
  parking_spots     integer not null default 0,
  has_storage       boolean not null default false,
  has_safe_room     boolean not null default false,
  build_year        integer,
  condition         text check (condition in ('new','renovated','needs_renovation','good')),
  description       text,   -- תיאור חופשי — זה מה שנחשף בלינק השיתוף
  internal_notes    text,   -- לעולם לא נחשף בלינק השיתוף
  seller_id         uuid references sellers(id),  -- מוכר יחיד לנכס (nullable)
  status            text not null default 'available'
                      check (status in ('available','in_negotiation','sold','removed')),
  main_image_id     uuid,   -- FK ל-property_images, נוסף ב-ALTER למטה
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index on properties (neighborhood_id);
create index on properties (seller_id);
create index on properties (status);

create table property_images (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references properties(id) on delete cascade,
  storage_path  text not null,
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index on property_images (property_id);

alter table properties
  add constraint properties_main_image_fk
  foreign key (main_image_id) references property_images(id) on delete set null;

-- buyers (לקוחות/קונים) — כולל סטטוס צבעוני ו-callback יחיד
create table buyers (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  phone          text,
  status         text not null default 'active'
                   check (status in ('inactive','active','in_closing','closed')),
  -- callback יחיד ללקוח. הקוביה נשארת על היום המקורי; done רק מחליף אדום→ירוק.
  callback_date  date,
  callback_done  boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index on buyers (callback_date) where callback_date is not null;

-- לוג CRM — כל עדכון עם תאריך+שעה אוטומטיים
create table buyer_updates (
  id          uuid primary key default gen_random_uuid(),
  buyer_id    uuid not null references buyers(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()   -- התאריך+שעה שמוצגים ב-UI
);

create index on buyer_updates (buyer_id, created_at desc);

-- buyer_property_interest — קשר M2M דו-כיווני.
-- טבלה אחת שמייצגת גם "מתעניינים בנכס X" וגם "וישליסט של לקוח Y".
-- הדו-כיווניות מובנית: שורה אחת נראית משני הצדדים. אין לוגיקת סנכרון.
create table buyer_property_interest (
  buyer_id     uuid not null references buyers(id) on delete cascade,
  property_id  uuid not null references properties(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (buyer_id, property_id)
);

create index on buyer_property_interest (property_id);

-- share_links — לינק צפייה בלבד לנכס בודד
create table share_links (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique default encode(gen_random_bytes(16), 'hex'),
  property_id  uuid not null references properties(id) on delete cascade,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index on share_links (token);

-- ============================================================================
-- 2. טריגר updated_at גנרי
-- ============================================================================

create or replace function set_updated_at() returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger t_properties_updated before update on properties
  for each row execute function set_updated_at();
create trigger t_buyers_updated before update on buyers
  for each row execute function set_updated_at();
create trigger t_sellers_updated before update on sellers
  for each row execute function set_updated_at();

-- ============================================================================
-- 3. RLS — מופעל על כל טבלה בלי יוצא מהכלל
-- ============================================================================

alter table neighborhoods            enable row level security;
alter table sellers                  enable row level security;
alter table properties               enable row level security;
alter table property_images          enable row level security;
alter table buyers                   enable row level security;
alter table buyer_updates            enable row level security;
alter table buyer_property_interest  enable row level security;
alter table share_links              enable row level security;

create policy "admin_all" on neighborhoods for all to authenticated
  using (true) with check (true);
create policy "admin_all" on sellers for all to authenticated
  using (true) with check (true);
create policy "admin_all" on properties for all to authenticated
  using (true) with check (true);
create policy "admin_all" on property_images for all to authenticated
  using (true) with check (true);
create policy "admin_all" on buyers for all to authenticated
  using (true) with check (true);
create policy "admin_all" on buyer_updates for all to authenticated
  using (true) with check (true);
create policy "admin_all" on buyer_property_interest for all to authenticated
  using (true) with check (true);
create policy "admin_all" on share_links for all to authenticated
  using (true) with check (true);

-- ============================================================================
-- 4. הרשאות — authenticated בלבד. ל-anon אין גישה לשום טבלה.
-- ============================================================================

grant usage on schema public to authenticated, anon;

grant all on all tables    in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

alter default privileges in schema public grant all on tables    to authenticated;
alter default privileges in schema public grant all on sequences to authenticated;

-- ✂ החיתוך של anon — כולל טבלאות עתידיות
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;
alter default privileges in schema public revoke all on tables    from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;

-- ============================================================================
-- 5. RPC — הגישה היחידה של הדף הציבורי /s/:token
--
-- מחזיר אך ורק פרטי נכס + תיאור חופשי + תמונות.
-- internal_notes, seller, buyers — לא נשלפים בכלל. זו ההגנה, לא הסתרה ב-UI.
-- ============================================================================

create or replace function get_shared_property(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prop_id uuid;
  v_result  jsonb;
begin
  select property_id into v_prop_id
  from share_links
  where token = p_token and revoked_at is null;

  if v_prop_id is null then
    return jsonb_build_object('error', 'invalid_or_revoked');
  end if;

  select jsonb_build_object(
    'address',       p.address,
    'city',          p.city,
    'price',         p.price,
    'property_type', p.property_type,
    'rooms',         p.rooms,
    'bedrooms',      p.bedrooms,
    'bathrooms',     p.bathrooms,
    'floor',         p.floor,
    'total_floors',  p.total_floors,
    'size_sqm',      p.size_sqm,
    'has_balcony',   p.has_balcony,
    'balcony_sqm',   p.balcony_sqm,
    'parking_spots', p.parking_spots,
    'has_storage',   p.has_storage,
    'has_safe_room', p.has_safe_room,
    'build_year',    p.build_year,
    'condition',     p.condition,
    'description',   p.description,   -- תיאור חופשי בלבד
    'neighborhood',  (select n.name from neighborhoods n where n.id = p.neighborhood_id),
    'images',        (select coalesce(jsonb_agg(pi.storage_path order by pi.position, pi.created_at), '[]'::jsonb)
                      from property_images pi where pi.property_id = p.id)
  ) into v_result
  from properties p
  where p.id = v_prop_id;

  return v_result;
end;
$$;

-- ה-RPC היחיד ש-anon רשאי להריץ
grant execute on function get_shared_property(text) to anon, authenticated;

-- ============================================================================
-- 6. Storage — bucket לתמונות נכסים
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "property_images_auth_insert" on storage.objects;
create policy "property_images_auth_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'property-images');

drop policy if exists "property_images_auth_update" on storage.objects;
create policy "property_images_auth_update" on storage.objects for update to authenticated
  using (bucket_id = 'property-images') with check (bucket_id = 'property-images');

drop policy if exists "property_images_auth_delete" on storage.objects;
create policy "property_images_auth_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'property-images');

drop policy if exists "property_images_public_read" on storage.objects;
create policy "property_images_public_read" on storage.objects for select to public
  using (bucket_id = 'property-images');
