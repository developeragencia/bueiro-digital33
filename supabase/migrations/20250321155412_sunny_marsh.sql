/*
  # Add UTMs table and related functionality

  1. New Tables
    - `utms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `base_url` (text)
      - `source` (text)
      - `medium` (text)
      - `campaign` (text)
      - `term` (text, optional)
      - `content` (text, optional)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `utms` table
    - Add policies for authenticated users to manage their UTMs
*/

CREATE TABLE IF NOT EXISTS utms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  base_url text NOT NULL,
  source text NOT NULL,
  medium text NOT NULL,
  campaign text NOT NULL,
  term text,
  content text,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE utms ENABLE ROW LEVEL SECURITY;

-- Users can read their own UTMs
CREATE POLICY "Users can read own utms"
  ON utms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Users can insert their own UTMs
CREATE POLICY "Users can insert own utms"
  ON utms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own UTMs
CREATE POLICY "Users can update own utms"
  ON utms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own UTMs
CREATE POLICY "Users can delete own utms"
  ON utms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_utms_updated_at
  BEFORE UPDATE ON utms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();