-- Grant applications table for submissions from the Apply page

CREATE TABLE IF NOT EXISTS public.grant_applications (
  id BIGSERIAL PRIMARY KEY,
  child_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  parent_name TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (public form, no auth required)
CREATE POLICY "Anyone can submit grant applications" ON public.grant_applications
  FOR INSERT WITH CHECK (true);

-- Only admins can view applications
CREATE POLICY "Admins can view grant applications" ON public.grant_applications
  FOR SELECT USING (public.is_admin());
