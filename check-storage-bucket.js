const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorageBucket() {
  try {
    console.log('🔍 Checking Supabase storage bucket for politician photos...');
    
    // List files in the politician-photos bucket
    const { data: files, error } = await supabase.storage
      .from('politician-photos')
      .list('', {
        limit: 100,
        offset: 0
      });
    
    if (error) {
      console.error('Error accessing storage bucket:', error);
      return;
    }
    
    if (!files || files.length === 0) {
      console.log('❌ No files found in politician-photos bucket');
    } else {
      console.log(`✅ Found ${files.length} files in politician-photos bucket:`);
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`);
      });
      
      // Get public URLs for these files
      console.log('\n🔗 Public URLs for these files:');
      files.forEach(file => {
        const { data } = supabase.storage
          .from('politician-photos')
          .getPublicUrl(file.name);
        console.log(`  - ${file.name}: ${data.publicUrl}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkStorageBucket();
