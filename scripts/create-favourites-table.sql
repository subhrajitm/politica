-- Create user_favourites table for favourites functionality
-- Run this in your Supabase SQL editor

-- Create user_favourites table
CREATE TABLE IF NOT EXISTS user_favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, politician_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favourites_user_id ON user_favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favourites_politician_id ON user_favourites(politician_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;

-- Create policy for user_favourites table - users can only access their own favourites
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own favourites' AND tablename = 'user_favourites') THEN
        CREATE POLICY "Users can manage their own favourites" ON user_favourites
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Verify the table was created
SELECT 'user_favourites table created successfully' as status;
