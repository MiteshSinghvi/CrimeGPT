import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ojtursiyvdbjaowzbelh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHVyc2l5dmRiamFvd3piZWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzgwNzAsImV4cCI6MjA5OTYxNDA3MH0.1UfrXsAKpk8PKyDBE5g2PJ12X4cmwwqLll3RRip0yFk";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTest() {
  console.log("Authenticating...");
  await supabase.auth.signInWithPassword({
    email: 'test_user_crimegpt@example.com',
    password: 'password123'
  });

  console.log("Attempting to insert test case with case_number and user_id...");
  const safeCasePayload = {
    id: crypto.randomUUID(),
    title: "Test Case Schema",
    status: 'active',
    priority: 'medium',
    assignee: 'Unassigned',
    progress: 0,
    date: new Date().toISOString(),
    location: 'Unassigned',
    case_number: 'TEST-1234',
    user_id: null
  };

  const { data, error } = await supabase.from('cases').insert([safeCasePayload]).select();
  
  if (error) {
    console.error("ERROR during insert:", error);
    process.exit(1);
  } else {
    console.log("SUCCESS! Inserted case:", data);
    
    // Clean up
    console.log("Cleaning up test case...");
    await supabase.from('cases').delete().eq('id', safeCasePayload.id);
    console.log("Cleanup successful.");
  }
}

runTest();
