-- PostgreSQL Full-Text Search Setup for PolitiFind
-- This script sets up comprehensive full-text search capabilities

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Add search vector columns to politicians table
ALTER TABLE politicians 
ADD COLUMN IF NOT EXISTS search_vector tsvector,
ADD COLUMN IF NOT EXISTS search_keywords text[];

-- Add search vector columns to related tables for comprehensive search
ALTER TABLE work_history 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE education 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE policy_stances 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE legislative_achievements 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE news_mentions 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE speeches 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_politicians_search_vector 
ON politicians USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_politicians_search_keywords 
ON politicians USING GIN(search_keywords);

CREATE INDEX IF NOT EXISTS idx_work_history_search_vector 
ON work_history USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_education_search_vector 
ON education USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_policy_stances_search_vector 
ON policy_stances USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_legislative_achievements_search_vector 
ON legislative_achievements USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_news_mentions_search_vector 
ON news_mentions USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_speeches_search_vector 
ON speeches USING GIN(search_vector);

-- Create trigram indexes for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_politicians_full_name_trgm 
ON politicians USING GIN(full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_politicians_party_trgm 
ON politicians USING GIN(party gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_politicians_constituency_trgm 
ON politicians USING GIN(constituency gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_politicians_current_position_trgm 
ON politicians USING GIN(current_position gin_trgm_ops);

-- Create function to generate search vector for politicians
CREATE OR REPLACE FUNCTION generate_politician_search_vector(politician_row politicians)
RETURNS tsvector AS $$
BEGIN
    RETURN setweight(to_tsvector('english', coalesce(politician_row.full_name, '')), 'A') ||
           setweight(to_tsvector('english', coalesce(politician_row.party, '')), 'B') ||
           setweight(to_tsvector('english', coalesce(politician_row.constituency, '')), 'B') ||
           setweight(to_tsvector('english', coalesce(politician_row.current_position, '')), 'C') ||
           setweight(to_tsvector('english', coalesce(politician_row.place_of_birth, '')), 'D') ||
           setweight(to_tsvector('english', coalesce(politician_row.nationality, '')), 'D') ||
           setweight(to_tsvector('english', coalesce(array_to_string(politician_row.languages, ' '), '')), 'D') ||
           setweight(to_tsvector('english', coalesce(array_to_string(politician_row.aliases, ' '), '')), 'B') ||
           setweight(to_tsvector('english', coalesce(array_to_string(politician_row.committees, ' '), '')), 'C');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to generate search keywords for politicians
CREATE OR REPLACE FUNCTION generate_politician_search_keywords(politician_row politicians)
RETURNS text[] AS $$
DECLARE
    keywords text[] := '{}';
BEGIN
    -- Add name variations
    IF politician_row.full_name IS NOT NULL THEN
        keywords := keywords || string_to_array(lower(politician_row.full_name), ' ');
    END IF;
    
    -- Add aliases
    IF politician_row.aliases IS NOT NULL THEN
        keywords := keywords || array(SELECT lower(unnest(politician_row.aliases)));
    END IF;
    
    -- Add party
    IF politician_row.party IS NOT NULL THEN
        keywords := keywords || ARRAY[lower(politician_row.party)];
    END IF;
    
    -- Add constituency
    IF politician_row.constituency IS NOT NULL THEN
        keywords := keywords || string_to_array(lower(politician_row.constituency), ' ');
    END IF;
    
    -- Add position
    IF politician_row.current_position IS NOT NULL THEN
        keywords := keywords || string_to_array(lower(politician_row.current_position), ' ');
    END IF;
    
    -- Add languages
    IF politician_row.languages IS NOT NULL THEN
        keywords := keywords || array(SELECT lower(unnest(politician_row.languages)));
    END IF;
    
    -- Add committees
    IF politician_row.committees IS NOT NULL THEN
        keywords := keywords || array(SELECT lower(unnest(politician_row.committees)));
    END IF;
    
    -- Remove duplicates and empty strings
    SELECT array_agg(DISTINCT keyword) INTO keywords
    FROM unnest(keywords) AS keyword
    WHERE keyword IS NOT NULL AND keyword != '';
    
    RETURN keywords;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to update search vectors for politicians
CREATE OR REPLACE FUNCTION update_politician_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := generate_politician_search_vector(NEW);
    NEW.search_keywords := generate_politician_search_keywords(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update search vectors for work history
CREATE OR REPLACE FUNCTION update_work_history_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.position, '')), 'A') ||
                        setweight(to_tsvector('english', coalesce(NEW.tenure, '')), 'B') ||
                        setweight(to_tsvector('english', coalesce(NEW.contributions, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update search vectors for education
CREATE OR REPLACE FUNCTION update_education_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.institution, '')), 'A') ||
                        setweight(to_tsvector('english', coalesce(NEW.degree, '')), 'B') ||
                        setweight(to_tsvector('english', coalesce(NEW.year, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update search vectors for policy stances
CREATE OR REPLACE FUNCTION update_policy_stances_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.issue, '')), 'A') ||
                        setweight(to_tsvector('english', coalesce(NEW.stance, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update search vectors for legislative achievements
CREATE OR REPLACE FUNCTION update_legislative_achievements_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.achievement, '')), 'A') ||
                        setweight(to_tsvector('english', coalesce(NEW.year, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update search vectors for news mentions
CREATE OR REPLACE FUNCTION update_news_mentions_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                        setweight(to_tsvector('english', coalesce(NEW.source, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update search vectors for speeches
CREATE OR REPLACE FUNCTION update_speeches_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic search vector updates
DROP TRIGGER IF EXISTS politician_search_vector_update ON politicians;
CREATE TRIGGER politician_search_vector_update
    BEFORE INSERT OR UPDATE ON politicians
    FOR EACH ROW EXECUTE FUNCTION update_politician_search_vector();

DROP TRIGGER IF EXISTS work_history_search_vector_update ON work_history;
CREATE TRIGGER work_history_search_vector_update
    BEFORE INSERT OR UPDATE ON work_history
    FOR EACH ROW EXECUTE FUNCTION update_work_history_search_vector();

DROP TRIGGER IF EXISTS education_search_vector_update ON education;
CREATE TRIGGER education_search_vector_update
    BEFORE INSERT OR UPDATE ON education
    FOR EACH ROW EXECUTE FUNCTION update_education_search_vector();

DROP TRIGGER IF EXISTS policy_stances_search_vector_update ON policy_stances;
CREATE TRIGGER policy_stances_search_vector_update
    BEFORE INSERT OR UPDATE ON policy_stances
    FOR EACH ROW EXECUTE FUNCTION update_policy_stances_search_vector();

DROP TRIGGER IF EXISTS legislative_achievements_search_vector_update ON legislative_achievements;
CREATE TRIGGER legislative_achievements_search_vector_update
    BEFORE INSERT OR UPDATE ON legislative_achievements
    FOR EACH ROW EXECUTE FUNCTION update_legislative_achievements_search_vector();

DROP TRIGGER IF EXISTS news_mentions_search_vector_update ON news_mentions;
CREATE TRIGGER news_mentions_search_vector_update
    BEFORE INSERT OR UPDATE ON news_mentions
    FOR EACH ROW EXECUTE FUNCTION update_news_mentions_search_vector();

DROP TRIGGER IF EXISTS speeches_search_vector_update ON speeches;
CREATE TRIGGER speeches_search_vector_update
    BEFORE INSERT OR UPDATE ON speeches
    FOR EACH ROW EXECUTE FUNCTION update_speeches_search_vector();

-- Function to refresh all search vectors (for existing data)
CREATE OR REPLACE FUNCTION refresh_all_search_vectors()
RETURNS void AS $$
BEGIN
    -- Update politicians search vectors
    UPDATE politicians SET 
        search_vector = generate_politician_search_vector(politicians.*),
        search_keywords = generate_politician_search_keywords(politicians.*);
    
    -- Update work history search vectors
    UPDATE work_history SET 
        search_vector = setweight(to_tsvector('english', coalesce(position, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(tenure, '')), 'B') ||
                       setweight(to_tsvector('english', coalesce(contributions, '')), 'C');
    
    -- Update education search vectors
    UPDATE education SET 
        search_vector = setweight(to_tsvector('english', coalesce(institution, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(degree, '')), 'B') ||
                       setweight(to_tsvector('english', coalesce(year, '')), 'C');
    
    -- Update policy stances search vectors
    UPDATE policy_stances SET 
        search_vector = setweight(to_tsvector('english', coalesce(issue, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(stance, '')), 'B');
    
    -- Update legislative achievements search vectors
    UPDATE legislative_achievements SET 
        search_vector = setweight(to_tsvector('english', coalesce(achievement, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(year, '')), 'B');
    
    -- Update news mentions search vectors
    UPDATE news_mentions SET 
        search_vector = setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(source, '')), 'B');
    
    -- Update speeches search vectors
    UPDATE speeches SET 
        search_vector = setweight(to_tsvector('english', coalesce(title, '')), 'A');
    
    RAISE NOTICE 'All search vectors have been refreshed successfully.';
END;
$$ LANGUAGE plpgsql;

-- Create search ranking function
CREATE OR REPLACE FUNCTION calculate_search_rank(
    search_vector tsvector,
    query tsquery,
    base_rank float4 DEFAULT 1.0
)
RETURNS float4 AS $$
BEGIN
    RETURN ts_rank_cd(search_vector, query) * base_rank;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create comprehensive search function
CREATE OR REPLACE FUNCTION search_politicians(
    search_query text,
    limit_count integer DEFAULT 50,
    offset_count integer DEFAULT 0
)
RETURNS TABLE(
    politician_id text,
    full_name text,
    party text,
    constituency text,
    current_position text,
    photo_url text,
    search_rank float4,
    match_type text
) AS $$
DECLARE
    query_tsquery tsquery;
    similarity_threshold float4 := 0.3;
BEGIN
    -- Convert search query to tsquery
    query_tsquery := plainto_tsquery('english', search_query);
    
    -- Return comprehensive search results with ranking
    RETURN QUERY
    SELECT DISTINCT
        p.id,
        p.full_name,
        p.party,
        p.constituency,
        p.current_position,
        p.photo_url,
        GREATEST(
            -- Full-text search rank
            COALESCE(ts_rank_cd(p.search_vector, query_tsquery), 0) * 2.0,
            -- Trigram similarity for fuzzy matching
            GREATEST(
                similarity(p.full_name, search_query),
                similarity(p.party, search_query),
                similarity(p.constituency, search_query),
                similarity(p.current_position, search_query)
            )
        ) as rank,
        CASE 
            WHEN p.search_vector @@ query_tsquery THEN 'full_text'
            WHEN similarity(p.full_name, search_query) > similarity_threshold THEN 'name_similarity'
            WHEN similarity(p.party, search_query) > similarity_threshold THEN 'party_similarity'
            WHEN similarity(p.constituency, search_query) > similarity_threshold THEN 'constituency_similarity'
            WHEN similarity(p.current_position, search_query) > similarity_threshold THEN 'position_similarity'
            ELSE 'keyword_match'
        END as match_type
    FROM politicians p
    WHERE 
        -- Full-text search match
        p.search_vector @@ query_tsquery
        OR
        -- Fuzzy matching with trigrams
        similarity(p.full_name, search_query) > similarity_threshold
        OR
        similarity(p.party, search_query) > similarity_threshold
        OR
        similarity(p.constituency, search_query) > similarity_threshold
        OR
        similarity(p.current_position, search_query) > similarity_threshold
        OR
        -- Keyword array matching
        search_query = ANY(p.search_keywords)
        OR
        -- Partial keyword matching
        EXISTS (
            SELECT 1 FROM unnest(p.search_keywords) as keyword
            WHERE keyword ILIKE '%' || search_query || '%'
        )
    ORDER BY rank DESC, p.full_name
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create function for search suggestions/autocomplete
CREATE OR REPLACE FUNCTION get_search_suggestions(
    partial_query text,
    limit_count integer DEFAULT 10
)
RETURNS TABLE(
    suggestion text,
    suggestion_type text,
    frequency integer
) AS $$
BEGIN
    RETURN QUERY
    WITH suggestions AS (
        -- Name suggestions
        SELECT DISTINCT 
            p.full_name as suggestion,
            'politician' as suggestion_type,
            1 as frequency
        FROM politicians p
        WHERE p.full_name ILIKE partial_query || '%'
        
        UNION ALL
        
        -- Party suggestions
        SELECT DISTINCT 
            p.party as suggestion,
            'party' as suggestion_type,
            COUNT(*)::integer as frequency
        FROM politicians p
        WHERE p.party ILIKE partial_query || '%'
        GROUP BY p.party
        
        UNION ALL
        
        -- Constituency suggestions
        SELECT DISTINCT 
            p.constituency as suggestion,
            'constituency' as suggestion_type,
            COUNT(*)::integer as frequency
        FROM politicians p
        WHERE p.constituency ILIKE partial_query || '%'
        GROUP BY p.constituency
        
        UNION ALL
        
        -- Position suggestions
        SELECT DISTINCT 
            p.current_position as suggestion,
            'position' as suggestion_type,
            COUNT(*)::integer as frequency
        FROM politicians p
        WHERE p.current_position ILIKE partial_query || '%'
        GROUP BY p.current_position
        
        UNION ALL
        
        -- Keyword suggestions
        SELECT DISTINCT 
            keyword as suggestion,
            'keyword' as suggestion_type,
            1 as frequency
        FROM politicians p, unnest(p.search_keywords) as keyword
        WHERE keyword ILIKE partial_query || '%'
    )
    SELECT s.suggestion, s.suggestion_type, s.frequency
    FROM suggestions s
    WHERE s.suggestion IS NOT NULL AND s.suggestion != ''
    ORDER BY s.frequency DESC, s.suggestion
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get related politicians (for recommendations)
CREATE OR REPLACE FUNCTION get_related_politicians(
    politician_id text,
    limit_count integer DEFAULT 5
)
RETURNS TABLE(
    related_politician_id text,
    full_name text,
    party text,
    constituency text,
    current_position text,
    photo_url text,
    relation_score float4,
    relation_type text
) AS $$
DECLARE
    target_politician politicians%ROWTYPE;
BEGIN
    -- Get the target politician details
    SELECT * INTO target_politician FROM politicians WHERE id = politician_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT DISTINCT
        p.id,
        p.full_name,
        p.party,
        p.constituency,
        p.current_position,
        p.photo_url,
        GREATEST(
            -- Same party bonus
            CASE WHEN p.party = target_politician.party THEN 0.5 ELSE 0 END,
            -- Same constituency bonus
            CASE WHEN p.constituency = target_politician.constituency THEN 0.7 ELSE 0 END,
            -- Similar position bonus
            CASE WHEN similarity(p.current_position, target_politician.current_position) > 0.3 THEN 0.3 ELSE 0 END,
            -- Committee overlap bonus
            CASE WHEN p.committees && target_politician.committees THEN 0.4 ELSE 0 END
        ) as relation_score,
        CASE 
            WHEN p.constituency = target_politician.constituency THEN 'same_constituency'
            WHEN p.party = target_politician.party THEN 'same_party'
            WHEN p.committees && target_politician.committees THEN 'shared_committees'
            WHEN similarity(p.current_position, target_politician.current_position) > 0.3 THEN 'similar_position'
            ELSE 'general'
        END as relation_type
    FROM politicians p
    WHERE 
        p.id != politician_id
        AND (
            p.party = target_politician.party
            OR p.constituency = target_politician.constituency
            OR similarity(p.current_position, target_politician.current_position) > 0.3
            OR p.committees && target_politician.committees
        )
    ORDER BY relation_score DESC, p.full_name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Execute the refresh function to populate search vectors for existing data
SELECT refresh_all_search_vectors();

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_politicians_party_constituency 
ON politicians(party, constituency);

CREATE INDEX IF NOT EXISTS idx_politicians_updated_at 
ON politicians(updated_at DESC);

-- Add comment for documentation
COMMENT ON FUNCTION search_politicians(text, integer, integer) IS 
'Comprehensive search function that combines full-text search with fuzzy matching for politician discovery';

COMMENT ON FUNCTION get_search_suggestions(text, integer) IS 
'Provides autocomplete suggestions for search queries based on politician data';

COMMENT ON FUNCTION get_related_politicians(text, integer) IS 
'Returns politicians related to a given politician based on party, constituency, position, and committees';

COMMENT ON COLUMN politicians.search_vector IS 
'Full-text search vector containing weighted searchable content';

COMMENT ON COLUMN politicians.search_keywords IS 
'Array of keywords extracted from politician data for exact matching';