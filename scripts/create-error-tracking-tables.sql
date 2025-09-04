-- Error tracking tables for PolitiFind
-- Run this script to create the necessary tables for error monitoring

-- Table for storing error logs
CREATE TABLE IF NOT EXISTS error_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_category TEXT NOT NULL,
    error_severity TEXT NOT NULL,
    component TEXT,
    user_id TEXT,
    session_id TEXT,
    url TEXT,
    user_agent TEXT,
    stack_trace TEXT,
    context JSONB,
    breadcrumbs JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for storing error alerts
CREATE TABLE IF NOT EXISTS error_alerts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    error_count INTEGER NOT NULL DEFAULT 0,
    time_window TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(error_severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(error_category);
CREATE INDEX IF NOT EXISTS idx_error_logs_component ON error_logs(component);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_code ON error_logs(error_code);

CREATE INDEX IF NOT EXISTS idx_error_alerts_timestamp ON error_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_alerts_acknowledged ON error_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_error_alerts_severity ON error_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_error_alerts_type ON error_alerts(type);

-- Row Level Security (RLS) policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_alerts ENABLE ROW LEVEL SECURITY;

-- Policy to allow admin users to read all error logs
CREATE POLICY "Admin users can read error logs" ON error_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy to allow the application to insert error logs
CREATE POLICY "Application can insert error logs" ON error_logs
    FOR INSERT WITH CHECK (true);

-- Policy to allow admin users to read all alerts
CREATE POLICY "Admin users can read error alerts" ON error_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy to allow the application to insert and update alerts
CREATE POLICY "Application can manage error alerts" ON error_alerts
    FOR ALL WITH CHECK (true);

-- Function to clean up old error logs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM error_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    DELETE FROM error_alerts 
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a view for error statistics
CREATE OR REPLACE VIEW error_statistics AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    error_category,
    error_severity,
    component,
    COUNT(*) as error_count,
    COUNT(DISTINCT session_id) as affected_sessions,
    COUNT(DISTINCT user_id) as affected_users
FROM error_logs 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), error_category, error_severity, component
ORDER BY hour DESC;

-- Grant necessary permissions
GRANT SELECT ON error_statistics TO authenticated;
GRANT SELECT, INSERT ON error_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON error_alerts TO authenticated;