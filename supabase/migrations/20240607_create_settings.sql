-- Create settings table
CREATE TABLE settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_name TEXT NOT NULL DEFAULT 'My E-commerce Store',
    support_email TEXT NOT NULL DEFAULT 'support@example.com',
    monthly_order_goal INTEGER NOT NULL DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings
INSERT INTO settings (site_name, support_email, monthly_order_goal)
VALUES ('My E-commerce Store', 'support@example.com', 1000);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read settings
CREATE POLICY "Allow authenticated users to read settings"
    ON settings FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for authenticated users to update settings
CREATE POLICY "Allow authenticated users to update settings"
    ON settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT, UPDATE ON settings TO authenticated; 