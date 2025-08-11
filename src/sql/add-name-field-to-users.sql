-- Add name field and user_id reference to user_emails table
-- This migration adds support for storing user names and linking to auth.users table

-- Add name column
ALTER TABLE user_emails 
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT '';

-- Add user_id column to reference auth.users table
ALTER TABLE user_emails 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to have a default name if empty
UPDATE user_emails 
SET name = COALESCE(name, 'User') 
WHERE name = '' OR name IS NULL;

-- Make name column required after setting default values
ALTER TABLE user_emails 
ALTER COLUMN name SET NOT NULL;

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_emails_user_id ON user_emails(user_id);

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_user_emails_email ON user_emails(email);
