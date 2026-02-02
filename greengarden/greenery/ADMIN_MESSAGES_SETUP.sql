-- Create admin_messages table
CREATE TABLE admin_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view admin messages
CREATE POLICY "Admin messages are viewable by all" 
  ON admin_messages 
  FOR SELECT 
  USING (true);

-- Policy: Only admins can create messages
-- Note: You need to have a way to identify admin users. 
-- You can check the profiles table for an admin role/flag
CREATE POLICY "Only admins can create messages" 
  ON admin_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Policy: Only the creator (admin) can delete their messages
CREATE POLICY "Admins can delete their own messages" 
  ON admin_messages 
  FOR DELETE 
  USING (admin_id = auth.uid());

-- Create index for better query performance
CREATE INDEX idx_admin_messages_created_at 
  ON admin_messages(created_at DESC);
