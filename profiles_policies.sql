-- ✅ COMPLETE RLS POLICIES FOR SUPABASE
-- This script sets up proper authentication, admin features, and RLS policies for all tables

-- ============================================
-- PROFILES TABLE - User Management
-- ============================================

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if not exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Drop existing policies
DROP POLICY IF EXISTS "Read own profile" ON profiles;
DROP POLICY IF EXISTS "Admin read all profiles" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "Insert own profile" ON profiles;
DROP POLICY IF EXISTS "Read all profiles" ON profiles;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own profile
CREATE POLICY "Insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to read their own profile
CREATE POLICY "Read own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Allow authenticated users to read all profiles (for admin dashboard)
CREATE POLICY "Read all profiles"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy: Allow users to update their own profile
CREATE POLICY "Update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Delete any invalid profiles not linked to existing users
DELETE FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users);


-- ============================================
-- SEEDS TABLE - RLS POLICIES
-- ============================================

-- Create seeds table if not exists
CREATE TABLE IF NOT EXISTS seeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if not exist
ALTER TABLE seeds ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE seeds ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS on seeds table
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view all seeds" ON seeds;
DROP POLICY IF EXISTS "Allow authenticated users to insert seeds" ON seeds;
DROP POLICY IF EXISTS "Allow delete seeds" ON seeds;
DROP POLICY IF EXISTS "Allow update seeds" ON seeds;
DROP POLICY IF EXISTS "Allow admin to delete seeds" ON seeds;
DROP POLICY IF EXISTS "Allow admin to update seeds" ON seeds;
DROP POLICY IF EXISTS "Allow users to delete their own seeds" ON seeds;
DROP POLICY IF EXISTS "Allow users to update their own seeds" ON seeds;

-- Policies for seeds
CREATE POLICY "Allow authenticated users to view all seeds"
ON seeds
FOR SELECT
USING (approved = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert seeds"
ON seeds
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own seeds"
ON seeds
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own seeds"
ON seeds
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ✅ ADMIN POLICIES FOR SEEDS
CREATE POLICY "Allow admin to delete seeds"
ON seeds
FOR DELETE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "Allow admin to update seeds"
ON seeds
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));


-- ============================================
-- VEGETABLES TABLE - RLS POLICIES
-- ============================================

-- Create vegetables table if not exists
CREATE TABLE IF NOT EXISTS vegetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if not exist
ALTER TABLE vegetables ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE vegetables ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS on vegetables table
ALTER TABLE vegetables ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view all vegetables" ON vegetables;
DROP POLICY IF EXISTS "Allow authenticated users to insert vegetables" ON vegetables;
DROP POLICY IF EXISTS "Allow delete vegetables" ON vegetables;
DROP POLICY IF EXISTS "Allow update vegetables" ON vegetables;
DROP POLICY IF EXISTS "Allow admin to delete vegetables" ON vegetables;
DROP POLICY IF EXISTS "Allow admin to update vegetables" ON vegetables;
DROP POLICY IF EXISTS "Allow users to delete their own vegetables" ON vegetables;
DROP POLICY IF EXISTS "Allow users to update their own vegetables" ON vegetables;

-- Policies for vegetables
CREATE POLICY "Allow authenticated users to view all vegetables"
ON vegetables
FOR SELECT
USING (approved = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert vegetables"
ON vegetables
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own vegetables"
ON vegetables
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own vegetables"
ON vegetables
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ✅ ADMIN POLICIES FOR VEGETABLES
CREATE POLICY "Allow admin to delete vegetables"
ON vegetables
FOR DELETE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "Allow admin to update vegetables"
ON vegetables
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));


-- ============================================
-- PLANTS TABLE - RLS POLICIES
-- ============================================

-- Create plants table if not exists
CREATE TABLE IF NOT EXISTS plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if not exist
ALTER TABLE plants ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS on plants table
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view all plants" ON plants;
DROP POLICY IF EXISTS "Allow authenticated users to insert plants" ON plants;
DROP POLICY IF EXISTS "Allow delete plants" ON plants;
DROP POLICY IF EXISTS "Allow update plants" ON plants;
DROP POLICY IF EXISTS "Allow admin to delete plants" ON plants;
DROP POLICY IF EXISTS "Allow admin to update plants" ON plants;
DROP POLICY IF EXISTS "Allow users to delete their own plants" ON plants;
DROP POLICY IF EXISTS "Allow users to update their own plants" ON plants;

-- Policies for plants
CREATE POLICY "Allow authenticated users to view all plants"
ON plants
FOR SELECT
USING (approved = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert plants"
ON plants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own plants"
ON plants
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own plants"
ON plants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ✅ ADMIN POLICIES FOR PLANTS
CREATE POLICY "Allow admin to delete plants"
ON plants
FOR DELETE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "Allow admin to update plants"
ON plants
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));


-- ============================================
-- FERTILIZERS TABLE - RLS POLICIES
-- ============================================

-- Create fertilizers table if not exists
CREATE TABLE IF NOT EXISTS fertilizers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if not exist
ALTER TABLE fertilizers ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE fertilizers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS on fertilizers table
ALTER TABLE fertilizers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view all fertilizers" ON fertilizers;
DROP POLICY IF EXISTS "Allow authenticated users to insert fertilizers" ON fertilizers;
DROP POLICY IF EXISTS "Allow delete fertilizers" ON fertilizers;
DROP POLICY IF EXISTS "Allow update fertilizers" ON fertilizers;
DROP POLICY IF EXISTS "Allow admin to delete fertilizers" ON fertilizers;
DROP POLICY IF EXISTS "Allow admin to update fertilizers" ON fertilizers;
DROP POLICY IF EXISTS "Allow users to delete their own fertilizers" ON fertilizers;
DROP POLICY IF EXISTS "Allow users to update their own fertilizers" ON fertilizers;

-- Policies for fertilizers
CREATE POLICY "Allow authenticated users to view all fertilizers"
ON fertilizers
FOR SELECT
USING (approved = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert fertilizers"
ON fertilizers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own fertilizers"
ON fertilizers
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own fertilizers"
ON fertilizers
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ✅ ADMIN POLICIES FOR FERTILIZERS
CREATE POLICY "Allow admin to delete fertilizers"
ON fertilizers
FOR DELETE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "Allow admin to update fertilizers"
ON fertilizers
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));


-- ============================================
-- SAMPLING TABLE - RLS POLICIES
-- ============================================

-- Create sampling table if not exists
CREATE TABLE IF NOT EXISTS sampling (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if not exist
ALTER TABLE sampling ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE sampling ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS on sampling table
ALTER TABLE sampling ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view all sampling" ON sampling;
DROP POLICY IF EXISTS "Allow authenticated users to insert sampling" ON sampling;
DROP POLICY IF EXISTS "Allow delete sampling" ON sampling;
DROP POLICY IF EXISTS "Allow update sampling" ON sampling;
DROP POLICY IF EXISTS "Allow admin to delete sampling" ON sampling;
DROP POLICY IF EXISTS "Allow admin to update sampling" ON sampling;
DROP POLICY IF EXISTS "Allow users to delete their own sampling" ON sampling;
DROP POLICY IF EXISTS "Allow users to update their own sampling" ON sampling;

-- Policies for sampling
CREATE POLICY "Allow authenticated users to view all sampling"
ON sampling
FOR SELECT
USING (approved = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert sampling"
ON sampling
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own sampling"
ON sampling
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own sampling"
ON sampling
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ✅ ADMIN POLICIES FOR SAMPLING
CREATE POLICY "Allow admin to delete sampling"
ON sampling
FOR DELETE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "Allow admin to update sampling"
ON sampling
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));


-- ============================================
-- STORAGE POLICIES FOR PRODUCT-IMAGES BUCKET
-- ============================================

-- Enable RLS on storage.objects if not already
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for product-images
DROP POLICY IF EXISTS "Public access to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their uploads in product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their uploads in product-images" ON storage.objects;

-- Policies for product-images bucket
CREATE POLICY "Public access to product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload to product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update their uploads in product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authenticated users can delete their uploads in product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);