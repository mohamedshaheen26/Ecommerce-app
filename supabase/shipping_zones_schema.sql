-- Shipping zones table for admin shipping management
create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null,
  shipping_fee numeric(10,2) not null default 0 check (shipping_fee >= 0),
  estimated_days integer not null default 1 check (estimated_days >= 1),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_shipping_zones_name
  on public.shipping_zones (name);

create unique index if not exists idx_shipping_zones_name_ar
  on public.shipping_zones (name_ar);

create index if not exists idx_shipping_zones_created_at
  on public.shipping_zones (created_at desc);

create or replace function public.set_shipping_zones_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_shipping_zones_updated_at on public.shipping_zones;

create trigger set_shipping_zones_updated_at
before update on public.shipping_zones
for each row
execute procedure public.set_shipping_zones_updated_at();
