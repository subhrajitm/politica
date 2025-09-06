-- Supabase Database Schema for OurNation App
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

-- Create political_parties table
CREATE TABLE IF NOT EXISTS political_parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_local TEXT, -- Local language name
  country_code TEXT NOT NULL, -- ISO 3166-1 alpha-2 country code
  country_name TEXT NOT NULL,
  ideology TEXT, -- e.g., "Social Democratic", "Conservative", "Liberal"
  political_position TEXT, -- e.g., "Centre-left", "Far-right", "Centre"
  founded_year INTEGER,
  current_leader TEXT,
  headquarters TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  membership_count INTEGER,
  is_ruling_party BOOLEAN DEFAULT FALSE,
  is_parliamentary BOOLEAN DEFAULT FALSE,
  is_regional BOOLEAN DEFAULT FALSE, -- For regional/state parties
  region_state TEXT, -- For regional parties
  electoral_performance JSONB, -- Store election results
  social_media JSONB, -- Store social media handles
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, country_code) -- Prevent duplicate parties in same country
);

-- Create party_affiliations table to link politicians to parties
CREATE TABLE IF NOT EXISTS party_affiliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES political_parties(id) ON DELETE CASCADE,
  position_in_party TEXT, -- e.g., "Member", "Leader", "Deputy Leader"
  joined_date DATE,
  left_date DATE,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(politician_id, party_id, is_current) -- One current affiliation per party
);

-- Create user_favourites table
CREATE TABLE IF NOT EXISTS user_favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, politician_id)
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
CREATE INDEX IF NOT EXISTS idx_user_favourites_user_id ON user_favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favourites_politician_id ON user_favourites(politician_id);

-- Indexes for political parties
CREATE INDEX IF NOT EXISTS idx_political_parties_country_code ON political_parties(country_code);
CREATE INDEX IF NOT EXISTS idx_political_parties_name ON political_parties(name);
CREATE INDEX IF NOT EXISTS idx_political_parties_ideology ON political_parties(ideology);
CREATE INDEX IF NOT EXISTS idx_political_parties_ruling ON political_parties(is_ruling_party);
CREATE INDEX IF NOT EXISTS idx_political_parties_parliamentary ON political_parties(is_parliamentary);
CREATE INDEX IF NOT EXISTS idx_political_parties_regional ON political_parties(is_regional);

-- Indexes for party affiliations
CREATE INDEX IF NOT EXISTS idx_party_affiliations_politician_id ON party_affiliations(politician_id);
CREATE INDEX IF NOT EXISTS idx_party_affiliations_party_id ON party_affiliations(party_id);
CREATE INDEX IF NOT EXISTS idx_party_affiliations_current ON party_affiliations(is_current);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_politicians_updated_at') THEN
        CREATE TRIGGER update_politicians_updated_at 
            BEFORE UPDATE ON politicians 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create trigger for political_parties table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_political_parties_updated_at') THEN
        CREATE TRIGGER update_political_parties_updated_at 
            BEFORE UPDATE ON political_parties 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

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
ALTER TABLE political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_affiliations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for migration and development
-- These can be tightened later for production

-- Politicians table - allow all operations for now
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on politicians' AND tablename = 'politicians') THEN
        CREATE POLICY "Allow all operations on politicians" ON politicians
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Work history table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on work_history' AND tablename = 'work_history') THEN
        CREATE POLICY "Allow all operations on work_history" ON work_history
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Education table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on education' AND tablename = 'education') THEN
        CREATE POLICY "Allow all operations on education" ON education
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Electoral history table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on electoral_history' AND tablename = 'electoral_history') THEN
        CREATE POLICY "Allow all operations on electoral_history" ON electoral_history
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Policy stances table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on policy_stances' AND tablename = 'policy_stances') THEN
        CREATE POLICY "Allow all operations on policy_stances" ON policy_stances
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Voting records table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on voting_records' AND tablename = 'voting_records') THEN
        CREATE POLICY "Allow all operations on voting_records" ON voting_records
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Legislative achievements table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on legislative_achievements' AND tablename = 'legislative_achievements') THEN
        CREATE POLICY "Allow all operations on legislative_achievements" ON legislative_achievements
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Ratings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on ratings' AND tablename = 'ratings') THEN
        CREATE POLICY "Allow all operations on ratings" ON ratings
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Campaign finance table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on campaign_finance' AND tablename = 'campaign_finance') THEN
        CREATE POLICY "Allow all operations on campaign_finance" ON campaign_finance
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Relationships table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on relationships' AND tablename = 'relationships') THEN
        CREATE POLICY "Allow all operations on relationships" ON relationships
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- News mentions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on news_mentions' AND tablename = 'news_mentions') THEN
        CREATE POLICY "Allow all operations on news_mentions" ON news_mentions
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Speeches table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on speeches' AND tablename = 'speeches') THEN
        CREATE POLICY "Allow all operations on speeches" ON speeches
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Social media table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on social_media' AND tablename = 'social_media') THEN
        CREATE POLICY "Allow all operations on social_media" ON social_media
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Political parties table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on political_parties' AND tablename = 'political_parties') THEN
        CREATE POLICY "Allow all operations on political_parties" ON political_parties
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Party affiliations table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on party_affiliations' AND tablename = 'party_affiliations') THEN
        CREATE POLICY "Allow all operations on party_affiliations" ON party_affiliations
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Enable RLS on user_favourites table
ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;

-- User favourites table - users can only access their own favourites
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own favourites' AND tablename = 'user_favourites') THEN
        CREATE POLICY "Users can manage their own favourites" ON user_favourites
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Note: These policies allow all operations for now to enable migration
-- In production, you should tighten these policies for security

-- Create admin_profiles table for admin user profiles (references auth.users)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table for site configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('site_name', 'OurNation', 'The name of the website'),
  ('site_description', 'Find Politicians In Your Area', 'The description of the website'),
  ('contact_email', 'contact@ournation.com', 'Contact email address'),
  ('require_approval', 'true', 'Whether to require admin approval for new submissions'),
  ('enable_public_contributions', 'false', 'Whether to enable public contributions')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for admin_profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_profiles_updated_at') THEN
        CREATE TRIGGER update_admin_profiles_updated_at 
            BEFORE UPDATE ON admin_profiles 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create trigger for settings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_updated_at') THEN
        CREATE TRIGGER update_settings_updated_at 
            BEFORE UPDATE ON settings 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS on admin_profiles table
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on admin_profiles' AND tablename = 'admin_profiles') THEN
        CREATE POLICY "Allow all operations on admin_profiles" ON admin_profiles
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Enable RLS on settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policy for settings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on settings' AND tablename = 'settings') THEN
        CREATE POLICY "Allow all operations on settings" ON settings
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
