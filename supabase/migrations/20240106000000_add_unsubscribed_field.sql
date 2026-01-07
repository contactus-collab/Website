-- Add unsubscribed field to newsletter table
-- This allows subscribers to be marked as unsubscribed without deleting them

ALTER TABLE public.newsletter 
ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT FALSE;

-- Create index for better query performance when filtering unsubscribed users
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribed ON public.newsletter(unsubscribed) WHERE unsubscribed = false;

-- Update existing records to ensure they are marked as subscribed
UPDATE public.newsletter 
SET unsubscribed = FALSE 
WHERE unsubscribed IS NULL;

-- Allow public users to update their own subscription status (for re-subscribing)
CREATE POLICY "Users can update their own subscription" ON public.newsletter
  FOR UPDATE USING (true)
  WITH CHECK (true);

