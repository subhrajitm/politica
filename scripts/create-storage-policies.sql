-- Create storage bucket for politician photos
-- Note: This script only creates the bucket. Policies must be created via Supabase Dashboard
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'politician-photos',
  'politician-photos',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- IMPORTANT: Storage policies cannot be created via SQL in Supabase
-- You must create them through the Supabase Dashboard:
-- 1. Go to Storage > Policies
-- 2. Select the 'politician-photos' bucket
-- 3. Create the following policies manually:

-- Policy 1: Public read access
-- Name: "Public read access for politician photos"
-- Operation: SELECT
-- Target roles: public
-- USING expression: bucket_id = 'politician-photos'

-- Policy 2: Authenticated upload
-- Name: "Authenticated users can upload politician photos"
-- Operation: INSERT
-- Target roles: authenticated
-- WITH CHECK expression: bucket_id = 'politician-photos'

-- Policy 3: Authenticated update
-- Name: "Authenticated users can update politician photos"
-- Operation: UPDATE
-- Target roles: authenticated
-- USING expression: bucket_id = 'politician-photos'

-- Policy 4: Authenticated delete
-- Name: "Authenticated users can delete politician photos"
-- Operation: DELETE
-- Target roles: authenticated
-- USING expression: bucket_id = 'politician-photos'
