insert into menu_items (name, description, price, category_id, image_url, available)
select v.name, v.description, v.price, c.id, null, true
from (values
('Classic Espresso','Rich and concentrated espresso shot.',120::numeric,'Hot Drinks'),
('Double Espresso','Two shots of bold espresso.',160::numeric,'Hot Drinks'),
('Flat White','Silky microfoam over espresso.',190::numeric,'Hot Drinks'),
('Café Mocha','Espresso with chocolate and milk.',210::numeric,'Hot Drinks'),
('White Chocolate Mocha','Espresso with white chocolate.',220::numeric,'Hot Drinks'),
('Caramel Macchiato','Vanilla milk marked with espresso and caramel.',230::numeric,'Hot Drinks'),
('Vanilla Latte','Espresso and milk with vanilla.',200::numeric,'Hot Drinks'),
('Hazelnut Latte','Espresso and milk with hazelnut.',200::numeric,'Hot Drinks'),
('Honey Cinnamon Latte','Espresso, milk, honey and cinnamon.',210::numeric,'Hot Drinks'),
('Spanish Latte','Espresso with condensed milk.',220::numeric,'Hot Drinks'),
('Café au Lait','Coffee with steamed milk.',170::numeric,'Hot Drinks'),
('Americano','Espresso diluted with hot water.',150::numeric,'Hot Drinks'),
('Cortado','Equal parts espresso and warm milk.',180::numeric,'Hot Drinks'),
('Classic Masala Chai','Spiced Indian tea with milk.',120::numeric,'Hot Drinks'),
('Ginger Cardamom Chai','Chai with ginger and cardamom.',130::numeric,'Hot Drinks'),
('Kashmiri Kahwa','Saffron and spice-infused tea.',160::numeric,'Hot Drinks'),
('Matcha Latte','Matcha whisked with milk.',210::numeric,'Hot Drinks'),
('Dark Hot Chocolate','Rich dark chocolate drink.',190::numeric,'Hot Drinks'),
('Salted Caramel Hot Chocolate','Hot chocolate with salted caramel.',210::numeric,'Hot Drinks'),
('Vanilla Bean Latte','Espresso, milk and vanilla bean.',200::numeric,'Hot Drinks'),
('Iced Spanish Latte','Iced espresso with condensed milk.',220::numeric,'Cold Drinks'),
('Iced Vanilla Latte','Iced espresso with vanilla milk.',200::numeric,'Cold Drinks'),
('Iced Caramel Macchiato','Iced vanilla milk marked with espresso and caramel.',230::numeric,'Cold Drinks'),
('Cold Brew Coffee','Slow-steeped cold brew.',190::numeric,'Cold Drinks'),
('Nitro-Style Cold Brew','Creamy nitrogen-style cold brew.',220::numeric,'Cold Drinks'),
('Iced Mocha','Iced espresso with chocolate milk.',210::numeric,'Cold Drinks'),
('Iced White Chocolate Mocha','Iced espresso with white chocolate.',220::numeric,'Cold Drinks'),
('Iced Matcha Latte','Iced matcha with milk.',210::numeric,'Cold Drinks'),
('Iced Strawberry Matcha','Iced matcha layered with strawberry.',230::numeric,'Cold Drinks'),
('Iced Peach Tea','Peach-infused iced tea.',160::numeric,'Cold Drinks'),
('Lemon Iced Tea','Lemon black iced tea.',150::numeric,'Cold Drinks'),
('Peach Iced Tea','Peach black iced tea.',160::numeric,'Cold Drinks'),
('Classic Lemonade','Fresh lemonade.',140::numeric,'Cold Drinks'),
('Strawberry Lemonade','Lemonade with strawberry.',160::numeric,'Cold Drinks'),
('Mango Smoothie','Mango yogurt smoothie.',200::numeric,'Cold Drinks'),
('Strawberry Banana Smoothie','Strawberry and banana smoothie.',200::numeric,'Cold Drinks'),
('Chocolate Milkshake','Chocolate milkshake.',190::numeric,'Cold Drinks'),
('Vanilla Milkshake','Vanilla milkshake.',180::numeric,'Cold Drinks'),
('Salted Caramel Frappé','Blended coffee frappé with caramel.',230::numeric,'Cold Drinks'),
('Espresso Tonic','Espresso over tonic water.',210::numeric,'Cold Drinks'),
('Grilled Cheese Sandwich','Toasted cheese sandwich.',220::numeric,'Food'),
('Chicken Club Sandwich','Chicken, bacon and lettuce sandwich.',280::numeric,'Food'),
('Paneer Tikka Sandwich','Paneer tikka in a toasted sandwich.',240::numeric,'Food'),
('Veggie Hummus Wrap','Hummus and vegetables in a wrap.',230::numeric,'Food'),
('Chicken Caesar Wrap','Chicken Caesar salad wrap.',260::numeric,'Food'),
('Margherita Flatbread','Tomato, mozzarella flatbread.',260::numeric,'Food'),
('Pesto Vegetable Sandwich','Pesto and roasted vegetables.',240::numeric,'Food'),
('Mushroom Cheese Toast','Mushrooms and cheese on toast.',220::numeric,'Food'),
('Classic French Toast','French toast with butter.',200::numeric,'Food'),
('Pancakes with Maple Syrup','Fluffy pancakes with maple syrup.',240::numeric,'Food'),
('Blueberry Pancakes','Pancakes with blueberries.',260::numeric,'Food'),
('Scrambled Eggs on Toast','Scrambled eggs on sourdough.',230::numeric,'Food'),
('Masala Cheese Toast','Spiced cheese toast.',200::numeric,'Food'),
('Crispy Potato Wedges','Seasoned potato wedges.',170::numeric,'Food'),
('Garlic Bread with Herbs','Garlic bread with herbs.',180::numeric,'Food'),
('Classic New York Cheesecake','Creamy New York cheesecake.',260::numeric,'Desserts'),
('Chocolate Fudge Cake','Rich chocolate fudge cake.',240::numeric,'Desserts'),
('Red Velvet Cake','Red velvet cake with cream cheese.',260::numeric,'Desserts'),
('Blueberry Cheesecake','Blueberry cheesecake.',270::numeric,'Desserts'),
('Tiramisu','Coffee-soaked tiramisu.',280::numeric,'Desserts'),
('Chocolate Brownie','Fudgy chocolate brownie.',180::numeric,'Desserts'),
('Walnut Brownie','Brownie with walnuts.',190::numeric,'Desserts'),
('Chocolate Chip Cookie','Classic chocolate chip cookie.',120::numeric,'Desserts'),
('Double Chocolate Cookie','Double chocolate cookie.',140::numeric,'Desserts'),
('Cinnamon Roll','Warm cinnamon roll.',180::numeric,'Desserts'),
('Lemon Tart','Tangy lemon tart.',200::numeric,'Desserts'),
('Apple Crumble','Warm apple crumble.',210::numeric,'Desserts'),
('Chocolate Lava Cake','Molten chocolate cake.',260::numeric,'Desserts'),
('Vanilla Panna Cotta','Vanilla panna cotta.',220::numeric,'Desserts'),
('Belgian Chocolate Mousse','Rich chocolate mousse.',240::numeric,'Desserts')
) as v(name, description, price, category_name)
join categories c on c.name = v.category_name
where not exists (select 1 from menu_items mi where mi.name = v.name);


-- Populate images for newly inserted or existing null-image records
update menu_items
set image_url = case name
  when 'Classic Espresso' then 'https://via.placeholder.com/photo/espresso/800x600'
  when 'Double Espresso' then 'https://via.placeholder.com/photo/espresso/800x600'
  when 'Flat White' then 'https://via.placeholder.com/photo/latte/800x600'
  when 'Café Mocha' then 'https://via.placeholder.com/photo/hot-chocolate/800x600'
  when 'White Chocolate Mocha' then 'https://via.placeholder.com/photo/hot-chocolate/800x600'
  when 'Caramel Macchiato' then 'https://via.placeholder.com/photo/latte/800x600'
  when 'Vanilla Latte' then 'https://via.placeholder.com/photo/latte/800x600'
  when 'Hazelnut Latte' then 'https://via.placeholder.com/photo/latte/800x600'
  when 'Honey Cinnamon Latte' then 'https://via.placeholder.com/photo/latte/800x600'
  when 'Spanish Latte' then 'https://via.placeholder.com/photo/latte/800x600'
  when 'Café au Lait' then 'https://via.placeholder.com/photo/latte/800x600'
  when 'Americano' then 'https://via.placeholder.com/photo/espresso/800x600'
  when 'Cortado' then 'https://via.placeholder.com/photo/espresso/800x600'
  when 'Classic Masala Chai' then 'https://via.placeholder.com/photo/hot-chocolate/800x600'
  when 'Ginger Cardamom Chai' then 'https://via.placeholder.com/photo/hot-chocolate/800x600'
  when 'Kashmiri Kahwa' then 'https://via.placeholder.com/photo/hot-chocolate/800x600'
  when 'Matcha Latte' then 'https://via.placeholder.com/photo/matcha/800x600'
  when 'Dark Hot Chocolate' then 'https://via.placeholder.com/photo/hot-chocolate/800x600'
  when 'Salted Caramel Hot Chocolate' then 'https://via.placeholder.com/photo/hot-chocolate/800x600'
  when 'Vanilla Bean Latte' then 'https://via.placeholder.com/photo/latte/800x600'
  when 'Iced Spanish Latte' then 'https://via.placeholder.com/photo/iced-coffee/800x600'
  when 'Iced Vanilla Latte' then 'https://via.placeholder.com/photo/iced-coffee/800x600'
  when 'Iced Caramel Macchiato' then 'https://via.placeholder.com/photo/iced-coffee/800x600'
  when 'Cold Brew Coffee' then 'https://via.placeholder.com/photo/cold-brew/800x600'
  when 'Nitro-Style Cold Brew' then 'https://via.placeholder.com/photo/cold-brew/800x600'
  when 'Iced Mocha' then 'https://via.placeholder.com/photo/iced-coffee/800x600'
  when 'Iced White Chocolate Mocha' then 'https://via.placeholder.com/photo/iced-coffee/800x600'
  when 'Iced Matcha Latte' then 'https://via.placeholder.com/photo/matcha/800x600'
  when 'Iced Strawberry Matcha' then 'https://via.placeholder.com/photo/matcha/800x600'
  when 'Iced Peach Tea' then 'https://via.placeholder.com/photo/lemonade/800x600'
  when 'Lemon Iced Tea' then 'https://via.placeholder.com/photo/lemonade/800x600'
  when 'Peach Iced Tea' then 'https://via.placeholder.com/photo/lemonade/800x600'
  when 'Classic Lemonade' then 'https://via.placeholder.com/photo/lemonade/800x600'
  when 'Strawberry Lemonade' then 'https://via.placeholder.com/photo/lemonade/800x600'
  when 'Mango Smoothie' then 'https://via.placeholder.com/photo/smoothie/800x600'
  when 'Strawberry Banana Smoothie' then 'https://via.placeholder.com/photo/smoothie/800x600'
  when 'Chocolate Milkshake' then 'https://via.placeholder.com/photo/smoothie/800x600'
  when 'Vanilla Milkshake' then 'https://via.placeholder.com/photo/smoothie/800x600'
  when 'Salted Caramel Frappé' then 'https://via.placeholder.com/photo/iced-coffee/800x600'
  when 'Espresso Tonic' then 'https://via.placeholder.com/photo/iced-coffee/800x600'
  when 'Grilled Cheese Sandwich' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Chicken Club Sandwich' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Paneer Tikka Sandwich' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Veggie Hummus Wrap' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Chicken Caesar Wrap' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Margherita Flatbread' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Pesto Vegetable Sandwich' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Mushroom Cheese Toast' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Classic French Toast' then 'https://via.placeholder.com/photo/french-toast/800x600'
  when 'Pancakes with Maple Syrup' then 'https://via.placeholder.com/photo/pancakes/800x600'
  when 'Blueberry Pancakes' then 'https://via.placeholder.com/photo/pancakes/800x600'
  when 'Scrambled Eggs on Toast' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Masala Cheese Toast' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Crispy Potato Wedges' then 'https://via.placeholder.com/photo/sandwich/800x600'
  when 'Garlic Bread with Herbs' then 'https://via.placeholder.com/photo/garlic-bread/800x600'
  when 'Classic New York Cheesecake' then 'https://via.placeholder.com/photo/cheesecake/800x600'
  when 'Chocolate Fudge Cake' then 'https://via.placeholder.com/photo/chocolate-cake/800x600'
  when 'Red Velvet Cake' then 'https://via.placeholder.com/photo/chocolate-cake/800x600'
  when 'Blueberry Cheesecake' then 'https://via.placeholder.com/photo/cheesecake/800x600'
  when 'Tiramisu' then 'https://via.placeholder.com/photo/tiramisu/800x600'
  when 'Chocolate Brownie' then 'https://via.placeholder.com/photo/brownie/800x600'
  when 'Walnut Brownie' then 'https://via.placeholder.com/photo/brownie/800x600'
  when 'Chocolate Chip Cookie' then 'https://via.placeholder.com/photo/brownie/800x600'
  when 'Double Chocolate Cookie' then 'https://via.placeholder.com/photo/brownie/800x600'
  when 'Cinnamon Roll' then 'https://via.placeholder.com/photo/croissant/800x600'
  when 'Lemon Tart' then 'https://via.placeholder.com/photo/cheesecake/800x600'
  when 'Apple Crumble' then 'https://via.placeholder.com/photo/brownie/800x600'
  when 'Chocolate Lava Cake' then 'https://via.placeholder.com/photo/chocolate-cake/800x600'
  when 'Vanilla Panna Cotta' then 'https://via.placeholder.com/photo/cheesecake/800x600'
  when 'Belgian Chocolate Mousse' then 'https://via.placeholder.com/photo/chocolate-cake/800x600'
end
where image_url is null or image_url = '';

