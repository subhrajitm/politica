-- Create user_interactions table for tracking user behavior
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('view', 'search', 'favorite', 'unfavorite', 'share', 'click', 'hover', 'scroll')),
  target_type TEXT NOT NULL CHECK (target_type IN ('politician', 'search', 'page', 'feature')),
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info JSONB,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target ON user_interactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session ON user_interactions(session_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_target ON user_interactions(user_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_timestamp ON user_interactions(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target_timestamp ON user_interactions(target_type, target_id, timestamp DESC);

-- Create GIN index for metadata queries
CREATE INDEX IF NOT EXISTS idx_user_interactions_metadata ON user_interactions USING GIN(metadata);

-- Enable Row Level Security
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own interactions
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own interactions' AND tablename = 'user_interactions') THEN
        CREATE POLICY "Users can manage their own interactions" ON user_interactions
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $;

-- Create policy for anonymous interaction tracking (optional)
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous interaction tracking' AND tablename = 'user_interactions') THEN
        CREATE POLICY "Allow anonymous interaction tracking" ON user_interactions
            FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
    END IF;
END $;

-- Create function to get user interaction summary
CREATE OR REPLACE FUNCTION get_user_interaction_summary(
    target_user_id UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    interaction_type TEXT,
    target_type TEXT,
    interaction_count BIGINT,
    unique_targets BIGINT,
    last_interaction TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ui.type as interaction_type,
        ui.target_type,
        COUNT(*) as interaction_count,
        COUNT(DISTINCT ui.target_id) as unique_targets,
        MAX(ui.timestamp) as last_interaction
    FROM user_interactions ui
    WHERE ui.user_id = target_user_id
        AND ui.timestamp >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY ui.type, ui.target_type
    ORDER BY interaction_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get trending content
CREATE OR REPLACE FUNCTION get_trending_content(
    content_type TEXT DEFAULT 'politician',
    hours_back INTEGER DEFAULT 24,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
    target_id TEXT,
    interaction_score NUMERIC,
    unique_users BIGINT,
    total_interactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ui.target_id,
        SUM(
            CASE ui.type
                WHEN 'view' THEN 1
                WHEN 'search' THEN 2
                WHEN 'favorite' THEN 5
                WHEN 'unfavorite' THEN -3
                WHEN 'share' THEN 4
                WHEN 'click' THEN 2
                WHEN 'hover' THEN 0.5
                WHEN 'scroll' THEN 0.2
                ELSE 1
            END
        ) as interaction_score,
        COUNT(DISTINCT ui.user_id) as unique_users,
        COUNT(*) as total_interactions
    FROM user_interactions ui
    WHERE ui.target_type = content_type
        AND ui.timestamp >= NOW() - INTERVAL '1 hour' * hours_back
    GROUP BY ui.target_id
    HAVING COUNT(*) > 1  -- Filter out single interactions
    ORDER BY interaction_score DESC, unique_users DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to find similar users
CREATE OR REPLACE FUNCTION find_similar_users(
    target_user_id UUID,
    similarity_threshold NUMERIC DEFAULT 0.1,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    similar_user_id UUID,
    similarity_score NUMERIC,
    common_interactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_targets AS (
        SELECT DISTINCT target_id, target_type
        FROM user_interactions
        WHERE user_id = target_user_id
    ),
    other_user_interactions AS (
        SELECT 
            ui.user_id,
            COUNT(*) as common_count,
            COUNT(*) * 1.0 / (
                SELECT COUNT(DISTINCT target_id) 
                FROM user_interactions 
                WHERE user_id = ui.user_id
            ) as similarity
        FROM user_interactions ui
        INNER JOIN user_targets ut ON ui.target_id = ut.target_id AND ui.target_type = ut.target_type
        WHERE ui.user_id != target_user_id
        GROUP BY ui.user_id
        HAVING COUNT(*) * 1.0 / (
            SELECT COUNT(DISTINCT target_id) 
            FROM user_interactions 
            WHERE user_id = ui.user_id
        ) >= similarity_threshold
    )
    SELECT 
        oui.user_id as similar_user_id,
        oui.similarity as similarity_score,
        oui.common_count as common_interactions
    FROM other_user_interactions oui
    ORDER BY oui.similarity DESC, oui.common_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get personalized recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
    target_user_id UUID,
    recommendation_type TEXT DEFAULT 'politician',
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    recommended_id TEXT,
    recommendation_score NUMERIC,
    recommendation_reason TEXT
) AS $$
DECLARE
    user_parties TEXT[];
    user_constituencies TEXT[];
BEGIN
    -- Get user's preferred parties and constituencies
    SELECT ARRAY_AGG(DISTINCT p.party), ARRAY_AGG(DISTINCT p.constituency)
    INTO user_parties, user_constituencies
    FROM user_interactions ui
    JOIN politicians p ON ui.target_id = p.id
    WHERE ui.user_id = target_user_id 
        AND ui.target_type = 'politician'
        AND ui.type IN ('view', 'favorite', 'share');

    RETURN QUERY
    WITH user_viewed AS (
        SELECT DISTINCT target_id
        FROM user_interactions
        WHERE user_id = target_user_id AND target_type = recommendation_type
    ),
    similar_users AS (
        SELECT similar_user_id, similarity_score
        FROM find_similar_users(target_user_id, 0.1, 5)
    ),
    collaborative_recs AS (
        SELECT 
            ui.target_id as recommended_id,
            AVG(su.similarity_score) * COUNT(*) as score,
            'Similar users also viewed' as reason
        FROM user_interactions ui
        JOIN similar_users su ON ui.user_id = su.similar_user_id
        WHERE ui.target_type = recommendation_type
            AND ui.target_id NOT IN (SELECT target_id FROM user_viewed)
        GROUP BY ui.target_id
    ),
    content_based_recs AS (
        SELECT 
            p.id as recommended_id,
            CASE 
                WHEN p.party = ANY(user_parties) THEN 3.0
                WHEN p.constituency = ANY(user_constituencies) THEN 2.0
                ELSE 1.0
            END as score,
            CASE 
                WHEN p.party = ANY(user_parties) THEN 'Same party as your interests'
                WHEN p.constituency = ANY(user_constituencies) THEN 'From your area of interest'
                ELSE 'Popular content'
            END as reason
        FROM politicians p
        WHERE p.id NOT IN (SELECT target_id FROM user_viewed)
            AND (p.party = ANY(user_parties) OR p.constituency = ANY(user_constituencies))
    )
    SELECT * FROM (
        SELECT * FROM collaborative_recs
        UNION ALL
        SELECT * FROM content_based_recs
    ) combined_recs
    ORDER BY recommendation_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE user_interactions IS 'Tracks user interactions for analytics and recommendations';
COMMENT ON FUNCTION get_user_interaction_summary(UUID, INTEGER) IS 'Returns summary of user interactions over specified time period';
COMMENT ON FUNCTION get_trending_content(TEXT, INTEGER, INTEGER) IS 'Returns trending content based on user interactions';
COMMENT ON FUNCTION find_similar_users(UUID, NUMERIC, INTEGER) IS 'Finds users with similar interaction patterns';
COMMENT ON FUNCTION get_personalized_recommendations(UUID, TEXT, INTEGER) IS 'Generates personalized recommendations using collaborative and content-based filtering';