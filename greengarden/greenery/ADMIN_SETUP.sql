-- ============================================
-- ADMIN USER SETUP - RUN THIS IN SUPABASE
-- ============================================
-- Replace 'admin@example.com' with your actual admin email

-- 1. First, make sure the admin user has is_admin = true
UPDATE public.profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- 2. Verify the admin was updated
SELECT id, email, is_admin FROM public.profiles WHERE is_admin = true;

-- 3. Test: Try to approve a vegetable (this should work now)
-- UPDATE vegetables SET approved = true WHERE id = 'YOUR_VEGETABLE_ID';
