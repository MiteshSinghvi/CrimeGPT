import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ojtursiyvdbjaowzbelh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHVyc2l5dmRiamFvd3piZWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzgwNzAsImV4cCI6MjA5OTYxNDA3MH0.1UfrXsAKpk8PKyDBE5g2PJ12X4cmwwqLll3RRip0yFk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTest() {
  const badgeId = 'GUJ-CYB-038';
  console.log(`[TEST] Starting automated badge login test for ${badgeId}...`);
  
  // 1. Resolve Badge ID to Email
  console.log(`[TEST] Resolving email for Badge ID: ${badgeId}`);
  const { data: userRecord, error: lookupError } = await supabase
    .from('users')
    .select('email, rank')
    .ilike('badge_number', badgeId)
    .maybeSingle();

  if (lookupError || !userRecord || !userRecord.email) {
    console.error("[FAILED] Could not resolve Badge Number. Ensure the users table exists and is seeded.", lookupError);
    process.exit(1);
  }

  const resolvedEmail = userRecord.email;
  const expectedRole = userRecord.rank;
  console.log(`[SUCCESS] Resolved badge ${badgeId} to email: ${resolvedEmail} (Rank: ${expectedRole})`);

  // 2. Execute Sign-In
  console.log(`[TEST] Executing signInWithPassword for ${resolvedEmail}...`);
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: resolvedEmail,
    password: 'mitesh0112'
  });

  if (authError) {
    console.error("[FAILED] Authentication failed:", authError.message);
    process.exit(1);
  }

  // 3. Assert Session
  if (data.session && data.session.access_token) {
    console.log("[SUCCESS] Session is valid! Access Token retrieved.");
    console.log(`[SUCCESS] Assigned Role / Rank: ${expectedRole}`);
    console.log("[TEST PASSED 100%]");
  } else {
    console.error("[FAILED] Session is null or invalid.");
    process.exit(1);
  }
}

runTest();
