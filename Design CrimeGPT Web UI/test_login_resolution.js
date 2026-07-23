import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ojtursiyvdbjaowzbelh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHVyc2l5dmRiamFvd3piZWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzgwNzAsImV4cCI6MjA5OTYxNDA3MH0.1UfrXsAKpk8PKyDBE5g2PJ12X4cmwwqLll3RRip0yFk";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTest() {
  const badgeId = 'GUJ-CYB-038';
  console.log(`Resolving email for Badge ID: ${badgeId}`);
  
  const { data: userRecord, error: lookupError } = await supabase
    .from('users')
    .select('email, full_name, badge_number')
    .ilike('badge_number', badgeId)
    .maybeSingle();

  if (lookupError || !userRecord || !userRecord.email) {
    console.error("Failed to resolve Badge Number. Either the table isn't created or the record isn't seeded.", lookupError);
    process.exit(1);
  }

  console.log(`SUCCESS! Resolved badge ${badgeId} to email: ${userRecord.email}`);
  console.log(`Full Name: ${userRecord.full_name}`);
}

runTest();
