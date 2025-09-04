# Favourites Troubleshooting Guide

This guide helps you resolve common issues with the favourites functionality.

## Common Issues and Solutions

### 1. "Error loading favourites: {}" 

This error typically occurs when the `user_favourites` table doesn't exist in your database.

#### Solution:
1. **Run the database migration**:
   - Go to your Supabase Dashboard
   - Navigate to the SQL Editor
   - Run the following SQL script:

```sql
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

-- Create policy for user_favourites table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own favourites' AND tablename = 'user_favourites') THEN
        CREATE POLICY "Users can manage their own favourites" ON user_favourites
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
```

2. **Alternative: Use the provided script**:
   - Run the script at `scripts/create-favourites-table.sql` in your Supabase SQL editor

### 2. "Table 'user_favourites' doesn't exist"

This is the same as issue #1. Follow the same solution.

### 3. "Permission denied" or "RLS policy" errors

This occurs when Row Level Security policies are not properly configured.

#### Solution:
1. **Check RLS is enabled**:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_favourites';
```

2. **Verify the policy exists**:
```sql
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_favourites';
```

3. **Recreate the policy if missing**:
```sql
DROP POLICY IF EXISTS "Users can manage their own favourites" ON user_favourites;
CREATE POLICY "Users can manage their own favourites" ON user_favourites
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 4. Favourites not saving

This can happen due to several reasons:

#### Check 1: User Authentication
- Ensure the user is properly authenticated
- Check that `auth.uid()` returns a valid UUID

#### Check 2: Politician ID exists
- Verify the politician exists in the `politicians` table
- Check that the politician ID is valid

#### Check 3: Foreign Key Constraints
```sql
-- Check if politician exists
SELECT id, full_name FROM politicians WHERE id = 'your-politician-id';

-- Check if user exists
SELECT id, email FROM auth.users WHERE id = 'your-user-id';
```

### 5. Favourites not loading

#### Check 1: Database Connection
- Test the connection using the test API: `/api/test-favourites`
- Check browser console for network errors

#### Check 2: Query Structure
- The query uses a join with the `politicians` table
- Ensure both tables are accessible

### 6. "Cannot read properties of undefined" errors

This usually indicates a data structure mismatch.

#### Solution:
1. **Check the data structure**:
```typescript
// The expected structure should be:
{
  id: string,
  user_id: string,
  politician_id: string,
  created_at: string,
  politician: {
    id: string,
    full_name: string,
    party: string,
    constituency: string,
    current_position: string,
    photo_url: string
  }
}
```

2. **Verify politician data**:
```sql
SELECT id, full_name, party, constituency, current_position, photo_url 
FROM politicians 
LIMIT 1;
```

## Testing the Setup

### 1. Test Database Connection
Visit: `http://localhost:3000/api/test-favourites`

Expected response:
```json
{
  "success": true,
  "message": "Favourites table is accessible",
  "favouritesCount": 0,
  "politiciansCount": 1,
  "samplePolitician": { ... }
}
```

### 2. Test Favourites Functionality
1. Sign in to your account
2. Go to a politician's detail page
3. Click the "Add to Favourites" button
4. Check if the heart icon fills
5. Go to `/favourites` page to verify it appears

### 3. Check Browser Console
- Open Developer Tools (F12)
- Look for any error messages in the Console tab
- Check the Network tab for failed requests

## Environment Variables

Ensure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema Verification

Run this query to verify your database schema:
```sql
-- Check if all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('politicians', 'user_favourites', 'auth.users');

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'user_favourites';
```

## Still Having Issues?

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard > Logs
   - Look for any error messages

2. **Verify RLS Policies**:
   - Ensure policies are correctly configured
   - Test with a simple query

3. **Check Network Requests**:
   - Use browser DevTools to inspect network requests
   - Look for 401, 403, or 500 errors

4. **Test with Simple Query**:
```sql
-- Test basic access
SELECT COUNT(*) FROM user_favourites;

-- Test with auth
SELECT COUNT(*) FROM user_favourites WHERE user_id = auth.uid();
```

If you're still experiencing issues, please check:
- Supabase project settings
- Authentication configuration
- Database permissions
- Network connectivity
