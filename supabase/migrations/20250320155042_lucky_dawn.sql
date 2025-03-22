/*
  # Create dashboards table and policies

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `layout` (jsonb, default empty array)
      - `is_default` (boolean, default false)
      - `created_by` (uuid, references profiles.id)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `dashboards` table
    - Add policies for authenticated users to:
      - Read their own dashboards
      - Create new dashboards
      - Update their own dashboards
      - Delete their own dashboards
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own dashboards" ON dashboards;
  DROP POLICY IF EXISTS "Users can create dashboards" ON dashboards;
  DROP POLICY IF EXISTS "Users can update own dashboards" ON dashboards;
  DROP POLICY IF EXISTS "Users can delete own dashboards" ON dashboards;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  layout jsonb DEFAULT '[]'::jsonb NOT NULL,
  is_default boolean DEFAULT false NOT NULL,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "dashboard_read_policy" 
  ON dashboards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "dashboard_insert_policy"
  ON dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "dashboard_update_policy"
  ON dashboards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "dashboard_delete_policy"
  ON dashboards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards;
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE
  ON dashboards
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();