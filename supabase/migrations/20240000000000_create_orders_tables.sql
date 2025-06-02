-- Create enum for order status
CREATE TYPE order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status order_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping_address TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    shipping_method VARCHAR(50) NOT NULL DEFAULT 'standard',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create order items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(quantity * price), 0)
        FROM order_items
        WHERE order_id = NEW.order_id
    )
    WHERE id = NEW.order_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update order total
CREATE TRIGGER update_order_total_on_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

CREATE TRIGGER update_order_total_on_update
    AFTER UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

CREATE TRIGGER update_order_total_on_delete
    AFTER DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

-- Create RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for orders table
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own orders"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for order_items table
CREATE POLICY "Users can view their own order items"
    ON order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    ));

CREATE POLICY "Authenticated users can create order items"
    ON order_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    ));

-- Create view for order summaries
CREATE VIEW order_summaries AS
SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.shipping_address,
    o.payment_status,
    o.created_at,
    o.updated_at,
    COUNT(oi.id) as total_items,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Grant appropriate permissions
GRANT SELECT ON order_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT USAGE ON SEQUENCE orders_id_seq TO authenticated; 