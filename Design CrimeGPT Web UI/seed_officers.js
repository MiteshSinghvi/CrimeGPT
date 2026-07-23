import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ojtursiyvdbjaowzbelh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHVyc2l5dmRiamFvd3piZWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzgwNzAsImV4cCI6MjA5OTYxNDA3MH0.1UfrXsAKpk8PKyDBE5g2PJ12X4cmwwqLll3RRip0yFk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const OFFICERS = [
  { email: 'miteshsinghvi2007@gmail.com', badge_number: 'GUJ-CYB-035', rank: 'Precinct Commander' },
  { email: 'miteshsinghvi200@gmail.com', badge_number: 'GUJ-CYB-036', rank: 'Senior Cyber Investigator' },
  { email: 'miteshsinghvi20@gmail.com', badge_number: 'GUJ-CYB-037', rank: 'Digital Forensics Specialist' },
  { email: 'miteshsinghvi2@gmail.com', badge_number: 'GUJ-CYB-038', rank: 'Investigating Officer' },
  { email: 'miteshsinghvi@gmail.com', badge_number: 'GUJ-CYB-039', rank: 'Junior Cyber Analyst' }
];

async function seedOfficers() {
  console.log("Starting officer seeding process...");

  // 1. Find existing test user IDs
  console.log("Checking for existing test users to unlink from cases...");
  const { data: usersToWipe, error: queryError } = await supabase
    .from('users')
    .select('id')
    .like('email', '%miteshsinghvi%');

  if (queryError) {
    console.error("Error querying users table (ensure the table exists first):", queryError);
  } else if (usersToWipe && usersToWipe.length > 0) {
    const userIds = usersToWipe.map(u => u.id);
    
    // 2. Unassign them from cases so foreign key constraint doesn't block deletion
    console.log(`Unlinking ${userIds.length} users from existing cases...`);
    const { error: updateError } = await supabase
      .from('cases')
      .update({ user_id: null })
      .in('user_id', userIds);
      
    if (updateError) {
      console.error("Error unlinking users from cases:", updateError);
    } else {
      console.log("Successfully unlinked test users from cases.");
    }
  }

  // Seeding Loop
  for (const officer of OFFICERS) {
    console.log(`Processing ${officer.email}...`);

    // 1. Sign up the user in auth.users
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: officer.email,
      password: 'mitesh0112',
    });

    if (signUpError) {
      if (signUpError.message.includes("User already registered")) {
        console.log(`User ${officer.email} already exists in auth.users. Logging in to get session...`);
        await supabase.auth.signInWithPassword({
          email: officer.email,
          password: 'mitesh0112'
        });
      } else {
        console.error(`Failed to sign up ${officer.email}:`, signUpError);
        continue;
      }
    } else {
      console.log(`Successfully signed up ${officer.email} in auth.users.`);
    }

    // 2. Insert into public.users
    const profilePayload = {
      email: officer.email,
      full_name: "Mitesh Singhvi",
      badge_number: officer.badge_number,
      rank: officer.rank,
      department: 'Cyber Crime Division'
    };

    const { error: insertError } = await supabase
      .from('users')
      .upsert(profilePayload, { onConflict: 'badge_number' });

    if (insertError) {
      console.error(`Failed to insert profile for ${officer.email}:`, insertError);
    } else {
      console.log(`Successfully inserted profile for ${officer.email} (${officer.badge_number}).`);
    }
    
    // Sign out to ensure clean state for next iteration
    await supabase.auth.signOut();
  }

  console.log("Officer seeding complete!");
}

seedOfficers();
