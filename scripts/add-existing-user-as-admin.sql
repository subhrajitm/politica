-- Script to add existing Supabase Auth users as admins

-- STEP 1: First, find all users in your auth.users table
-- Run this query to see all your users:
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC;

-- STEP 2: Copy the user ID from the query above and use it in the INSERT below
-- Replace the values in the INSERT statement with actual data from your users

-- Example INSERT (replace with actual values from STEP 1):
-- INSERT INTO admin_profiles (id, email, name, role)
-- VALUES (
--   '12345678-1234-1234-1234-123456789012',  -- Copy actual user ID from STEP 1
--   'user@example.com',  -- Copy actual email from STEP 1
--   'User Name',  -- You can customize this name
--   'admin'  -- or 'super_admin' for super admin privileges
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   role = EXCLUDED.role,
--   updated_at = NOW();

-- STEP 3: If you want to add multiple users, repeat the INSERT for each user
-- Just make sure to use the correct user ID and email for each one
