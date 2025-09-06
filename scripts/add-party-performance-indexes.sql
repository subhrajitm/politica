-- Add performance indexes for political parties table
-- Run this in your Supabase SQL editor to improve query performance

-- Add index for UUID lookups (primary key should already have this, but let's be explicit)
CREATE INDEX IF NOT EXISTS idx_political_parties_id_btree ON political_parties USING btree (id);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_political_parties_country_name ON political_parties(country_name, name);

-- Add index for ruling party queries
CREATE INDEX IF NOT EXISTS idx_political_parties_ruling_country ON political_parties(is_ruling_party, country_code) WHERE is_ruling_party = true;

-- Add index for parliamentary party queries  
CREATE INDEX IF NOT EXISTS idx_political_parties_parliamentary_country ON political_parties(is_parliamentary, country_code) WHERE is_parliamentary = true;

-- Add index for regional party queries
CREATE INDEX IF NOT EXISTS idx_political_parties_regional_country ON political_parties(is_regional, country_code) WHERE is_regional = true;

-- Add index for name searches (case insensitive)
CREATE INDEX IF NOT EXISTS idx_political_parties_name_gin ON political_parties USING gin (to_tsvector('english', name));

-- Add index for ideology searches
CREATE INDEX IF NOT EXISTS idx_political_parties_ideology_gin ON political_parties USING gin (to_tsvector('english', ideology)) WHERE ideology IS NOT NULL;

-- Add partial index for parties with logos (for UI optimization)
CREATE INDEX IF NOT EXISTS idx_political_parties_has_logo ON political_parties(id, logo_url) WHERE logo_url IS NOT NULL;

-- Add index for website queries
CREATE INDEX IF NOT EXISTS idx_political_parties_website ON political_parties(website) WHERE website IS NOT NULL;

-- Add index for social media queries
CREATE INDEX IF NOT EXISTS idx_political_parties_social_media ON political_parties USING gin (social_media) WHERE social_media IS NOT NULL;

-- Add index for electoral performance queries
CREATE INDEX IF NOT EXISTS idx_political_parties_electoral_performance ON political_parties USING gin (electoral_performance) WHERE electoral_performance IS NOT NULL;

-- Update table statistics for better query planning
ANALYZE political_parties;

-- Show current indexes on political_parties table
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'political_parties'
ORDER BY indexname;
