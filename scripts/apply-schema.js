#!/usr/bin/env node

/**
 * Database Schema Application Script
 * 
 * This script helps apply the database schema to your Supabase database.
 * It will create the necessary tables for political parties.
 */

const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Extract only the political parties related schema
const politicalPartiesSchema = `
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

-- Enable Row Level Security
ALTER TABLE political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_affiliations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on political_parties' AND tablename = 'political_parties') THEN
        CREATE POLICY "Allow all operations on political_parties" ON political_parties
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on party_affiliations' AND tablename = 'party_affiliations') THEN
        CREATE POLICY "Allow all operations on party_affiliations" ON party_affiliations
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
`;

// Save the schema to a file
const outputPath = path.join(__dirname, '..', 'political-parties-schema.sql');
fs.writeFileSync(outputPath, politicalPartiesSchema);

console.log('✅ Political parties schema extracted and saved to:');
console.log(`   ${outputPath}`);
console.log('');
console.log('📋 Next steps:');
console.log('   1. Go to your Supabase dashboard');
console.log('   2. Navigate to the SQL Editor');
console.log('   3. Copy and paste the content from political-parties-schema.sql');
console.log('   4. Run the SQL to create the tables');
console.log('');
console.log('🔗 Or use the Supabase CLI:');
console.log(`   supabase db reset --linked`);
console.log('');
console.log('📄 Schema preview:');
console.log(politicalPartiesSchema.substring(0, 500) + '...');
