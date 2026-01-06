-- Initial schema for Ball Four Foundation
-- This migration creates the core tables and policies

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  date DATE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter table
CREATE TABLE IF NOT EXISTS newsletter (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to notes
CREATE POLICY "Notes are viewable by everyone" ON notes
  FOR SELECT USING (true);

-- Create policy for newsletter subscriptions
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter
  FOR INSERT WITH CHECK (true);

-- Create index on notes date for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(date DESC);
CREATE INDEX IF NOT EXISTS idx_notes_featured ON notes(featured) WHERE featured = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

