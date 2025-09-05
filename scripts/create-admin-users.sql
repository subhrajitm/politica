-- Script to create admin users in Supabase Auth
-- This file contains instructions and API examples for creating admin users

-- ============================================
-- METHOD 1: Create users via Supabase Dashboard
-- ============================================
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add user" and create these users:

-- Admin user:
-- Email: admin@ournation.com
-- Password: admin123
-- Role: admin

-- Super Admin user:
-- Email: superadmin@ournation.com  
-- Password: superadmin123
-- Role: super_admin

-- ============================================
-- METHOD 2: Create users via API (using your project details)
-- ============================================
-- Your Supabase URL: https://uuwogrjjgznqjcsexupk.supabase.co
-- You'll need your SERVICE_ROLE_KEY from the API Settings page

-- Create admin user:
-- curl -X POST 'https://uuwogrjjgznqjcsexupk.supabase.co/auth/v1/admin/users' \
-- -H "apikey: YOUR_SERVICE_ROLE_KEY" \
-- -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
-- -H "Content-Type: application/json" \
-- -d '{
--   "email": "admin@ournation.com",
--   "password": "admin123",
--   "email_confirm": true
-- }'

-- Create super admin user:
-- curl -X POST 'https://uuwogrjjgznqjcsexupk.supabase.co/auth/v1/admin/users' \
-- -H "apikey: YOUR_SERVICE_ROLE_KEY" \
-- -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
-- -H "Content-Type: application/json" \
-- -d '{
--   "email": "superadmin@ournation.com",
--   "password": "superadmin123",
--   "email_confirm": true
-- }'

-- ============================================
-- METHOD 3: Use existing users
-- ============================================
-- If you already have users in your Supabase Auth, you can:
-- 1. Run the find-and-add-admin.sql script to see your existing users
-- 2. Add them to the admin_profiles table
-- 3. Or use the User Management interface in the admin panel at http://localhost:3000/admin/user-management

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. After creating users in Supabase Auth, their profiles will be automatically
--    created in the admin_profiles table when they first log in.
-- 2. Make sure you've run the main supabase-schema.sql first to create the tables.
-- 3. Replace YOUR_SERVICE_ROLE_KEY with your actual service role key from Supabase.
-- 4. The service role key has full access - keep it secure and never expose it in client code.
