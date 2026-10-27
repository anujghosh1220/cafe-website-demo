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
  menu_item_id uuid references menu_items(id),
  item_name text not null,
  unit_price numeric not null check (unit_price >= 0),
  quantity int not null check (quantity > 0 and quantity <= 20),
  item_instructions text,
  created_at timestamptz default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order on order_items(order_id);

alter table orders enable row level security;
alter table order_items enable row level security;

create policy "chefs read orders" on orders for select using (public.is_admin_or_chef());
create policy "chefs update orders" on orders for update using (public.is_admin_or_chef()) with check (public.is_admin_or_chef());
create policy "public create orders via rpc" on orders for insert with check (false);
create policy "chefs read items" on order_items for select using (public.is_admin_or_chef());
create policy "public no direct items" on order_items for insert with check (false);

create or replace function create_order(p_table_number text, p_items jsonb, p_instructions text default null)
returns uuid language plpgsql security definer as $$
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
  insert into orders (order_number, table_number, special_instructions, total) values (v_number, p_table_number, p_instructions, 0) returning id into v_order_id;
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
  return v_order_id;
end;
$$;

grant execute on function create_order(text, jsonb, text) to anon, authenticated;
