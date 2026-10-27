update menu_items
set image_url = case
  when category_id = (select id from categories where name = 'Hot Drinks') then 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'
  when category_id = (select id from categories where name = 'Cold Drinks') then 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80'
  when category_id = (select id from categories where name = 'Food') then 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80'
  when category_id = (select id from categories where name = 'Desserts') then 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'
  else image_url
end
where image_url is null or image_url = '' or image_url like '%via.placeholder.com%';
