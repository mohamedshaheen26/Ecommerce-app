-- Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS stock_status text DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'low_stock')),
ADD COLUMN IF NOT EXISTS available_quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Rename name column to title for consistency
ALTER TABLE products RENAME COLUMN name TO title;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);

-- Create index on sku for faster lookups
CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);

-- Add unique constraint on slug
ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);

-- Add unique constraint on sku
ALTER TABLE products ADD CONSTRAINT products_sku_unique UNIQUE (sku);

-- Update RLS policies
ALTER POLICY "Enable read access for all users" ON "public"."products"
    USING (true);

ALTER POLICY "Enable insert for authenticated users only" ON "public"."products"
    WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Enable update for authenticated users only" ON "public"."products"
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Enable delete for authenticated users only" ON "public"."products"
    USING (auth.role() = 'authenticated');

-- Create a function to generate slug from title
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate slug
CREATE TRIGGER generate_product_slug_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION generate_product_slug(); 