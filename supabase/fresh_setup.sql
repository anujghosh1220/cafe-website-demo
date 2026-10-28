-- Fresh setup for The Velvet Bean
-- Run in a new empty Supabase project SQL Editor

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
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin','chef')),
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  table_number text not null,
  status text not null default 'new' check (status in ('new','preparing','ready','completed','cancelled')),
  customer_name text,
  special_instructions text,
  total numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  started_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users(id)
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  item_name text not null,
  unit_price numeric not null check (unit_price >= 0),
  quantity int not null check (quantity > 0 and quantity <= 20),
  item_instructions text,
  created_at timestamptz default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order on order_items(order_id);

alter table categories enable row level security;
alter table menu_items enable row level security;
alter table admin_profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create or replace function public.is_admin_or_chef()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admin_profiles ap where ap.user_id = auth.uid() and ap.role in ('admin','chef'));
$$;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admin_profiles ap where ap.user_id = auth.uid() and ap.role = 'admin');
$$;

-- categories/menu public read
create policy "public read categories" on categories for select using (true);
create policy "public read menu" on menu_items for select using (true);
create policy "admins manage categories" on categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage menu" on menu_items for all using (public.is_admin()) with check (public.is_admin());

-- admin_profiles
create policy "users read own profile" on admin_profiles for select using (auth.uid() = user_id);
create policy "admins read profiles" on admin_profiles for select using (public.is_admin());
create policy "admins manage profiles" on admin_profiles for all using (public.is_admin()) with check (public.is_admin());

-- orders
create policy "staff read orders" on orders for select using (public.is_admin_or_chef());
create policy "staff update orders" on orders for update using (public.is_admin_or_chef()) with check (public.is_admin_or_chef());
create policy "no direct insert orders" on orders for insert with check (false);
create policy "no delete orders" on orders for delete using (false);

create policy "staff read order items" on order_items for select using (public.is_admin_or_chef());
create policy "no direct insert items" on order_items for insert with check (false);

create or replace function public.create_order(p_table_number text, p_items jsonb, p_instructions text default null, p_customer_name text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid;
  v_number text;
  v_total numeric := 0;
  v_item jsonb;
  v_menu menu_items%rowtype;
  v_qty int;
begin
  if p_table_number is null or length(trim(p_table_number)) = 0 or length(p_table_number) > 20 then
    raise exception 'Invalid table number';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'No items';
  end if;
  v_number := 'ORD-' || lpad((floor(random()*999999))::text, 6, '0');
  insert into orders (order_number, table_number, special_instructions, customer_name, total) values (v_number, p_table_number, p_instructions, p_customer_name, 0) returning id into v_order_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty <= 0 or v_qty > 20 then raise exception 'Invalid quantity'; end if;
    select * into v_menu from menu_items where id = (v_item->>'menu_item_id')::uuid and available = true;
    if not found then raise exception 'Unavailable item'; end if;
    insert into order_items (order_id, menu_item_id, item_name, unit_price, quantity, item_instructions)
    values (v_order_id, v_menu.id, v_menu.name, v_menu.price, v_qty, v_item->>'instructions');
    v_total := v_total + (v_menu.price * v_qty);
  end loop;
  update orders set total = v_total where id = v_order_id;
  return v_number;
end;
$$;

grant execute on function public.create_order(text, jsonb, text, text) to anon, authenticated;

create or replace function public.advance_order_status(p_order_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_current text;
begin
  if not public.is_admin_or_chef() then raise exception 'Forbidden'; end if;
  select status into v_current from orders where id = p_order_id;
  if v_current is null then raise exception 'Not found'; end if;
  if not (
    (v_current='new' and p_status='preparing') or
    (v_current='preparing' and p_status='ready') or
    (v_current='ready' and p_status='completed')
  ) then raise exception 'Invalid transition'; end if;
  update orders set status = p_status, updated_at = now(),
    started_at = case when p_status='preparing' then now() else started_at end,
    ready_at = case when p_status='ready' then now() else ready_at end,
    completed_at = case when p_status='completed' then now() else completed_at end
  where id = p_order_id;
end;
$$;

grant execute on function public.advance_order_status(uuid, text) to authenticated;
