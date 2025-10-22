-- Puppet Master Web UI - Create Admin User
-- Run this SQL in your Supabase SQL Editor after creating the auth user

-- Step 1: First, create the auth user in Supabase Dashboard:
-- Go to Authentication > Users > Add User
-- Email: admin@yourdomain.com (replace with your email)
-- Password: (set a strong password)
-- Check "Auto Confirm User" if you want immediate access

-- Step 2: Then run this SQL to add the user to the users table:
-- Replace 'admin@yourdomain.com' with the actual email you used

INSERT INTO users (email, full_name, role, is_active)
SELECT
  email,
  'System Administrator',
  'admin',
  true
FROM auth.users
WHERE email = 'admin@yourdomain.com'
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Verify the user was created
SELECT id, email, full_name, role, is_active, created_at
FROM users
WHERE email = 'admin@yourdomain.com';

-- Optional: Create additional users with different roles

-- Create an operator user (can read and write, but limited admin functions)
-- INSERT INTO users (email, full_name, role, is_active)
-- SELECT email, 'Operator User', 'operator', true
-- FROM auth.users WHERE email = 'operator@yourdomain.com';

-- Create a viewer user (read-only access)
-- INSERT INTO users (email, full_name, role, is_active)
-- SELECT email, 'Viewer User', 'viewer', true
-- FROM auth.users WHERE email = 'viewer@yourdomain.com';
