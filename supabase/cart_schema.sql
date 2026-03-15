-- Cart table for customer shopping cart
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  selected_color text null,
  selected_size text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);
create index if not exists idx_cart_items_product_id on public.cart_items(product_id);

-- Unique product variant per user.
create unique index if not exists idx_cart_items_unique_variant
  on public.cart_items (
    user_id,
    product_id,
    coalesce(selected_color, ''),
    coalesce(selected_size, '')
  );

alter table public.cart_items enable row level security;

drop policy if exists "Users can view their cart items" on public.cart_items;
drop policy if exists "Users can insert their cart items" on public.cart_items;
drop policy if exists "Users can update their cart items" on public.cart_items;
drop policy if exists "Users can delete their cart items" on public.cart_items;

create policy "Users can view their cart items"
  on public.cart_items
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their cart items"
  on public.cart_items
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their cart items"
  on public.cart_items
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their cart items"
  on public.cart_items
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_cart_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cart_items_updated_at on public.cart_items;

create trigger set_cart_items_updated_at
before update on public.cart_items
for each row
execute procedure public.set_cart_items_updated_at();
