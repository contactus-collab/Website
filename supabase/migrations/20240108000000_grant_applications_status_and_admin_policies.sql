-- Add status to grant_applications and allow admins to update/delete

ALTER TABLE public.grant_applications
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'rejected'));

-- Admins can update applications (e.g. set status to granted/rejected)
CREATE POLICY "Admins can update grant applications" ON public.grant_applications
  FOR UPDATE USING (public.is_admin());

-- Admins can delete applications
CREATE POLICY "Admins can delete grant applications" ON public.grant_applications
  FOR DELETE USING (public.is_admin());
