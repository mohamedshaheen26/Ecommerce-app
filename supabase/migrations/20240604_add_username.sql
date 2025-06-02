-- Add username column to users table
ALTER TABLE users ADD COLUMN username TEXT;

-- Make username unique
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Create an index for faster username lookups
CREATE INDEX users_username_idx ON users(username);

-- Update existing users to have a default username from their email
UPDATE users 
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL;

-- Make username required for future entries
ALTER TABLE users ALTER COLUMN username SET NOT NULL; 