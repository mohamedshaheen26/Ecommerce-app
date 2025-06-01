-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add some default categories
INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Clothing'),
    ('Books'),
    ('Home & Garden'),
    ('Sports & Outdoors');

-- Add new columns to products
ALTER TABLE products
    ADD COLUMN category_id UUID REFERENCES categories(id),
    ADD COLUMN image_url TEXT;

-- Remove stock column from products
ALTER TABLE products
    DROP COLUMN stock;

-- Update existing products to have a default category (Electronics)
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Electronics');

-- Make category_id NOT NULL after setting default values
ALTER TABLE products
    ALTER COLUMN category_id SET NOT NULL; 