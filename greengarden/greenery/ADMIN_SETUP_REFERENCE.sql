-- 🔑 QUICK REFERENCE: Admin Setup for Supabase

-- ============================================
-- STEP 1: VERIFY YOUR PROJECT ID
-- ============================================
-- Your Project ID: uatoxkofrxxbvipkcwve
-- Dashboard: https://supabase.com/dashboard/project/uatoxkofrxxbvipkcwve

-- ============================================
-- STEP 2: RUN THIS SQL IN SUPABASE SQL EDITOR
-- ============================================
-- Location: https://supabase.com/dashboard/project/uatoxkofrxxbvipkcwve/sql/new
-- 1. Go to the URL above
-- 2. Copy the ENTIRE content from profiles_policies.sql (provided separately)
-- 3. Paste into SQL Editor
-- 4. Click RUN button
-- 5. Wait for success message

-- ============================================
-- STEP 3: VERIFY THE SETUP
-- ============================================
-- After running the SQL, verify it worked:
-- 1. Go to: https://supabase.com/dashboard/project/uatoxkofrxxbvipkcwve/sql/new
-- 2. Run this query:

SELECT 
  id, 
  email, 
  is_admin, 
  created_at 
FROM public.profiles 
WHERE is_admin = true;

-- You should see at least one row with is_admin = TRUE

-- ============================================
-- STEP 4: SET YOUR ADMIN USER
-- ============================================
-- Option A: Via SQL (Replace YOUR_EMAIL@domain.com with your actual email)

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'YOUR_EMAIL@domain.com';

-- Option B: Via Table Editor (Visual)
-- 1. Go to: https://supabase.com/dashboard/project/uatoxkofrxxbvipkcwve/editor
-- 2. Select "profiles" table from left sidebar
-- 3. Find your user row
-- 4. Click on the row to edit
-- 5. Set is_admin column to TRUE
-- 6. Click Save

-- ============================================
-- STEP 5: TEST IN ADMIN DASHBOARD
-- ============================================
-- 1. Go to your app: http://localhost:5173 (or your dev server)
-- 2. Go to Admin Dashboard
-- 3. Try to EDIT a product:
--    - Change name or price
--    - Click Save
--    - Should see: "✅ [name] updated successfully"
--    - NO console error about "no-op"
-- 4. Try to APPROVE a product:
--    - Click Approve
--    - Should see: "✅ [name] approved successfully"
-- 5. Try to DELETE a product:
--    - Click Delete
--    - Confirm
--    - Should see: "✅ deleted successfully"

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- Check if is_admin column exists:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Check all profiles in the system:
SELECT id, email, is_admin, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Check current policies on vegetables table:
SELECT policyname, definition 
FROM pg_policies 
WHERE tablename = 'vegetables';

-- Check current policies on all product tables:
SELECT tablename, policyname, permissive 
FROM pg_policies 
WHERE tablename IN ('seeds', 'vegetables', 'plants', 'fertilizers', 'sampling')
ORDER BY tablename, policyname;

-- ============================================
-- EXPECTED POLICY NAMES AFTER SETUP
-- ============================================
-- For EACH table (seeds, vegetables, plants, fertilizers, sampling):
-- ✅ Allow authenticated users to view all [table]
-- ✅ Allow authenticated users to insert [table]
-- ✅ Allow users to delete their own [table]
-- ✅ Allow users to update their own [table]
-- ✅ Allow admin to delete [table]
-- ✅ Allow admin to update [table]

-- That's 6 policies per table = 30 policies total for 5 product tables
-- Plus 4 policies for profiles = 34 total

-- ============================================
-- USEFUL SQL SNIPPETS
-- ============================================

-- Count total policies:
SELECT COUNT(*) as total_policies 
FROM pg_policies;

-- Show all policies in JSON format:
SELECT tablename, array_agg(policyname) as policies 
FROM pg_policies 
WHERE tablename IN ('seeds', 'vegetables', 'plants', 'fertilizers', 'sampling', 'profiles')
GROUP BY tablename;

-- Verify admin can update vegetables:
SELECT * FROM public.profiles WHERE is_admin = true;

-- Check which tables have RLS enabled:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('seeds', 'vegetables', 'plants', 'fertilizers', 'sampling', 'profiles')
ORDER BY tablename;

-- ============================================
-- QUICK DEBUG: Current User Session
-- ============================================
-- Run this in your browser console (F12):
-- console.log(await supabase.auth.getSession())
-- 
-- Check the user ID and compare with the profiles.id that has is_admin = true

-- ============================================
-- IF YOU MADE MISTAKES - RESET INSTRUCTIONS
-- ============================================
-- If you accidentally changed something wrong, you can re-run the full SQL file
-- to reset all policies. Just re-run the entire profiles_policies.sql content.
-- It uses DROP POLICY IF EXISTS to clean up old policies first.

-- ============================================
-- ALL DONE! 🎉
-- ============================================
-- Your admin dashboard should now work perfectly!
-- - No more "no-op" errors
-- - Edit, approve, and delete work correctly
-- - Products update instantly
