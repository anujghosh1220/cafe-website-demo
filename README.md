# The Velvet Bean — Café Website Demo

## Stack
React, Vite, TypeScript, Tailwind CSS, Supabase.

## Live
https://cafe-website-demo-livid.vercel.app/

## GitHub
https://github.com/anujghosh1220/cafe-website-demo

## Environment
Create `.env` in project root:
```
VITE_SUPABASE_URL=https://jqvaylrcpizwramllaft.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Mug8QsfkAdNW3Akdv6nfHQ_O0XbpnVE
```

## Admin credentials (initial setup)
- Email: admin123@gmail.com
- Password: test123

Additional admin used during setup:
- Email: anujghosh588@gmail.com

Admin login URL: /admin

## Database schema
Tables:
- categories (id, name, created_at)
- menu_items (id, name, description, price, category_id, image_url, available, created_at)
- admin_profiles (user_id, email, role, created_at)

Roles: admin, chef.

RLS: public read categories/menu_items; admins manage; admin_profiles readable by self/admins.

## SQL files
- supabase/schema.sql — schema + RLS
- supabase/seed.sql — initial categories
- supabase/seed_menu_items.sql — 70 items + images
- supabase/update_menu_images.sql — image repair

## Edge Function
- supabase/functions/manage-admins/index.ts
- Deploy: `supabase functions deploy manage-admins`
- Secrets: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (or secret key variants)

## Missing / manual steps
- Run schema.sql and seed scripts in Supabase SQL Editor
- Create initial admin user in Supabase Auth and admin_profiles row
- Deploy edge function and set secrets
- Configure Vercel env vars
- Chef order backend not implemented (no orders table)
- Admin user management requires deployed function
- Image URLs need SQL execution to populate
- Admin password reset if invalid credentials

## Commands
```
npm install
npm run build
```
