insert into categories (name) values
  ('Hot Drinks'),
  ('Cold Drinks'),
  ('Food'),
  ('Desserts')
on conflict (name) do nothing;

insert into menu_items (name, description, price, category_id, image_url, available)
select v.name, v.description, v.price, c.id, v.image_url, true
from (values
  ('Velvet Cappuccino','Espresso, steamed milk, silky foam.',180::numeric,'Hot Drinks','https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80'),
  ('Slow Pour Over','Single-origin beans, hand-poured.',220::numeric,'Hot Drinks','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80'),
  ('Rose Masala Chai','Spiced tea with rose petals.',120::numeric,'Hot Drinks','https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80'),
  ('Signature Velvet Latte','House special with caramel drizzle.',240::numeric,'Hot Drinks','https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80'),
  ('Iced Americano','Chilled espresso over ice.',170::numeric,'Cold Drinks','https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'),
  ('Almond Croissant','Buttery, flaky, toasted.',160::numeric,'Desserts','https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'),
  ('Avocado Toast','Sourdough, avocado, chili flakes.',260::numeric,'Food','https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=600&q=80')
) as v(name,description,price,cat,image_url)
join categories c on c.name = v.cat
where not exists (select 1 from menu_items mi where mi.name = v.name);
