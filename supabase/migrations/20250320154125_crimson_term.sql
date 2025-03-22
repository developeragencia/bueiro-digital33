/*
  # Create dashboards tables

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `layout` (jsonb)
      - `is_default` (boolean)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `dashboards` table
    - Add policies for authenticated users to manage their dashboards
*/

CREATE TABLE IF NOT EXISTS dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Users can read their own dashboards
CREATE POLICY "Users can read own dashboards"
  ON dashboards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Users can insert their own dashboards
CREATE POLICY "Users can insert own dashboards"
  ON dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own dashboards
CREATE POLICY "Users can update own dashboards"
  ON dashboards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Users can delete their own dashboards
CREATE POLICY "Users can delete own dashboards"
  ON dashboards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);