/*
  # Add integration settings and webhooks

  1. New Tables
    - `integration_settings`
      - `id` (uuid, primary key)
      - `platform` (text)
      - `settings` (jsonb)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `integration_settings` table
    - Add policies for authenticated users to manage their integration settings
*/

CREATE TABLE IF NOT EXISTS integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

-- Users can read their own integration settings
CREATE POLICY "Users can read own integration settings"
  ON integration_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Users can insert their own integration settings
CREATE POLICY "Users can insert integration settings"
  ON integration_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own integration settings
CREATE POLICY "Users can update integration settings"
  ON integration_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own integration settings
CREATE POLICY "Users can delete integration settings"
  ON integration_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();