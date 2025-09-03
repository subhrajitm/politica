-- Supabase Database Schema for Politica App
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create politicians table
CREATE TABLE IF NOT EXISTS politicians (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  aliases TEXT[],
  date_of_birth DATE NOT NULL,
  place_of_birth TEXT NOT NULL,
  gender TEXT NOT NULL,
  nationality TEXT NOT NULL,
  languages TEXT[] NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  photo_url TEXT NOT NULL,
  spouse TEXT,
  children TEXT[],
  party TEXT NOT NULL,
  constituency TEXT NOT NULL,
  current_position TEXT NOT NULL,
  assumed_office DATE NOT NULL,
  committees TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_history table
CREATE TABLE IF NOT EXISTS work_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  tenure TEXT NOT NULL,
  contributions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create education table
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create electoral_history table
CREATE TABLE IF NOT EXISTS electoral_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  election TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy_stances table
CREATE TABLE IF NOT EXISTS policy_stances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  stance TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voting_records table
CREATE TABLE IF NOT EXISTS voting_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  bill TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('Yea', 'Nay', 'Abstain')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create legislative_achievements table
CREATE TABLE IF NOT EXISTS legislative_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  achievement TEXT NOT NULL,
  year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  "group" TEXT NOT NULL,
  rating TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_finance table
CREATE TABLE IF NOT EXISTS campaign_finance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  total_receipts TEXT NOT NULL,
  total_disbursements TEXT NOT NULL,
  cash_on_hand TEXT NOT NULL,
  debt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Political', 'Corporate', 'Personal')),
  relationship TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_mentions table
CREATE TABLE IF NOT EXISTS news_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create speeches table
CREATE TABLE IF NOT EXISTS speeches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_media table
CREATE TABLE IF NOT EXISTS social_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  twitter TEXT,
  facebook TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_politicians_party ON politicians(party);
CREATE INDEX IF NOT EXISTS idx_politicians_constituency ON politicians(constituency);
CREATE INDEX IF NOT EXISTS idx_politicians_full_name ON politicians(full_name);
CREATE INDEX IF NOT EXISTS idx_work_history_politician_id ON work_history(politician_id);
CREATE INDEX IF NOT EXISTS idx_education_politician_id ON education(politician_id);
CREATE INDEX IF NOT EXISTS idx_electoral_history_politician_id ON electoral_history(politician_id);
CREATE INDEX IF NOT EXISTS idx_policy_stances_politician_id ON policy_stances(politician_id);
CREATE INDEX IF NOT EXISTS idx_voting_records_politician_id ON voting_records(politician_id);
CREATE INDEX IF NOT EXISTS idx_legislative_achievements_politician_id ON legislative_achievements(politician_id);
CREATE INDEX IF NOT EXISTS idx_ratings_politician_id ON ratings(politician_id);
CREATE INDEX IF NOT EXISTS idx_campaign_finance_politician_id ON campaign_finance(politician_id);
CREATE INDEX IF NOT EXISTS idx_relationships_politician_id ON relationships(politician_id);
CREATE INDEX IF NOT EXISTS idx_news_mentions_politician_id ON news_mentions(politician_id);
CREATE INDEX IF NOT EXISTS idx_speeches_politician_id ON speeches(politician_id);
CREATE INDEX IF NOT EXISTS idx_social_media_politician_id ON social_media(politician_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_politicians_updated_at 
    BEFORE UPDATE ON politicians 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - but with permissive policies for now
ALTER TABLE politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE electoral_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_stances ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE legislative_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for migration and development
-- These can be tightened later for production

-- Politicians table - allow all operations for now
CREATE POLICY "Allow all operations on politicians" ON politicians
    FOR ALL USING (true) WITH CHECK (true);

-- Work history table
CREATE POLICY "Allow all operations on work_history" ON work_history
    FOR ALL USING (true) WITH CHECK (true);

-- Education table
CREATE POLICY "Allow all operations on education" ON education
    FOR ALL USING (true) WITH CHECK (true);

-- Electoral history table
CREATE POLICY "Allow all operations on electoral_history" ON electoral_history
    FOR ALL USING (true) WITH CHECK (true);

-- Policy stances table
CREATE POLICY "Allow all operations on policy_stances" ON policy_stances
    FOR ALL USING (true) WITH CHECK (true);

-- Voting records table
CREATE POLICY "Allow all operations on voting_records" ON voting_records
    FOR ALL USING (true) WITH CHECK (true);

-- Legislative achievements table
CREATE POLICY "Allow all operations on legislative_achievements" ON legislative_achievements
    FOR ALL USING (true) WITH CHECK (true);

-- Ratings table
CREATE POLICY "Allow all operations on ratings" ON ratings
    FOR ALL USING (true) WITH CHECK (true);

-- Campaign finance table
CREATE POLICY "Allow all operations on campaign_finance" ON campaign_finance
    FOR ALL USING (true) WITH CHECK (true);

-- Relationships table
CREATE POLICY "Allow all operations on relationships" ON relationships
    FOR ALL USING (true) WITH CHECK (true);

-- News mentions table
CREATE POLICY "Allow all operations on news_mentions" ON news_mentions
    FOR ALL USING (true) WITH CHECK (true);

-- Speeches table
CREATE POLICY "Allow all operations on speeches" ON speeches
    FOR ALL USING (true) WITH CHECK (true);

-- Social media table
CREATE POLICY "Allow all operations on social_media" ON social_media
    FOR ALL USING (true) WITH CHECK (true);

-- Note: These policies allow all operations for now to enable migration
-- In production, you should tighten these policies for security
