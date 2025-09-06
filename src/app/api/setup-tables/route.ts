import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Setting up political parties tables...');

    // Check if political_parties table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'political_parties')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('Error checking table existence:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check table existence',
        details: tableError.message
      }, { status: 500 });
    }

    if (tableCheck && tableCheck.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Tables already exist',
        tables: ['political_parties', 'party_affiliations']
      });
    }

    // Create political_parties table
    const createPartiesTable = `
      CREATE TABLE IF NOT EXISTS political_parties (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        name_local TEXT,
        country_code TEXT NOT NULL,
        country_name TEXT NOT NULL,
        ideology TEXT,
        political_position TEXT,
        founded_year INTEGER,
        current_leader TEXT,
        headquarters TEXT,
        website TEXT,
        logo_url TEXT,
        description TEXT,
        membership_count INTEGER,
        is_ruling_party BOOLEAN DEFAULT FALSE,
        is_parliamentary BOOLEAN DEFAULT FALSE,
        is_regional BOOLEAN DEFAULT FALSE,
        region_state TEXT,
        electoral_performance JSONB,
        social_media JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(name, country_code)
      );
    `;

    const { error: partiesError } = await supabase.rpc('exec_sql', { sql: createPartiesTable });

    if (partiesError) {
      console.error('Error creating political_parties table:', partiesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create political_parties table',
        details: partiesError.message
      }, { status: 500 });
    }

    // Create party_affiliations table
    const createAffiliationsTable = `
      CREATE TABLE IF NOT EXISTS party_affiliations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        politician_id TEXT NOT NULL,
        party_id UUID NOT NULL REFERENCES political_parties(id) ON DELETE CASCADE,
        position_in_party TEXT,
        joined_date DATE,
        left_date DATE,
        is_current BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(politician_id, party_id, is_current)
      );
    `;

    const { error: affiliationsError } = await supabase.rpc('exec_sql', { sql: createAffiliationsTable });

    if (affiliationsError) {
      console.error('Error creating party_affiliations table:', affiliationsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create party_affiliations table',
        details: affiliationsError.message
      }, { status: 500 });
    }

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_political_parties_country_code ON political_parties(country_code);
      CREATE INDEX IF NOT EXISTS idx_political_parties_name ON political_parties(name);
      CREATE INDEX IF NOT EXISTS idx_political_parties_ideology ON political_parties(ideology);
      CREATE INDEX IF NOT EXISTS idx_party_affiliations_politician_id ON party_affiliations(politician_id);
      CREATE INDEX IF NOT EXISTS idx_party_affiliations_party_id ON party_affiliations(party_id);
    `;

    const { error: indexesError } = await supabase.rpc('exec_sql', { sql: createIndexes });

    if (indexesError) {
      console.warn('Warning: Failed to create indexes:', indexesError.message);
    }

    // Enable RLS
    const enableRLS = `
      ALTER TABLE political_parties ENABLE ROW LEVEL SECURITY;
      ALTER TABLE party_affiliations ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS });

    if (rlsError) {
      console.warn('Warning: Failed to enable RLS:', rlsError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Tables created successfully',
      tables: ['political_parties', 'party_affiliations']
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if tables exist
    const { data: partiesData, error: partiesError } = await supabase
      .from('political_parties')
      .select('count')
      .limit(1);

    const { data: affiliationsData, error: affiliationsError } = await supabase
      .from('party_affiliations')
      .select('count')
      .limit(1);

    return NextResponse.json({
      success: true,
      tables: {
        political_parties: {
          exists: !partiesError,
          error: partiesError?.message
        },
        party_affiliations: {
          exists: !affiliationsError,
          error: affiliationsError?.message
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
