-- Add shipping zone relation on orders
alter table public.orders
add column if not exists shipping_zone_id uuid null
references public.shipping_zones(id)
on delete set null;

create index if not exists idx_orders_shipping_zone_id
on public.orders(shipping_zone_id);
