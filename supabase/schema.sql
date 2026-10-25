create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null check (price > 0),
  category_id uuid references categories(id),
  image_url text,
  available boolean default true,
  created_at timestamptz default now()
);
create table if not exists admin_profiles (
  user_id uuid primary key references auth.users(id),
  email text not null,
  created_at timestamptz default now()
);
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table admin_profiles enable row level security;
create policy "public read categories" on categories for select using (true);
create policy "public read menu" on menu_items for select using (true);
create policy "users read own admin profile" on admin_profiles for select using (auth.uid() = user_id);
create policy "admins manage menu" on menu_items for all using (exists (select 1 from admin_profiles where user_id = auth.uid()));
