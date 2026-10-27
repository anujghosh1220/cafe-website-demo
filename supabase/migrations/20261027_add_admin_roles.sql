alter table admin_profiles add column if not exists role text not null default 'admin';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'admin_profiles_role_check') then
    alter table admin_profiles add constraint admin_profiles_role_check check (role in ('admin','chef'));
  end if;
end $$;
update admin_profiles set role = 'admin' where role is null;

create or replace function public.is_admin_or_chef()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.admin_profiles ap where ap.user_id = auth.uid() and ap.role in ('admin','chef'));
$$;
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.admin_profiles ap where ap.user_id = auth.uid() and ap.role = 'admin');
$$;
