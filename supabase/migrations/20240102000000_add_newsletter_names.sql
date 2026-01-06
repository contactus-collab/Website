-- Add first_name and last_name columns to newsletter table
ALTER TABLE newsletter 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add SELECT policy for newsletter table to check existing emails
CREATE POLICY "Allow checking existing newsletter subscriptions" ON newsletter
  FOR SELECT USING (true);

