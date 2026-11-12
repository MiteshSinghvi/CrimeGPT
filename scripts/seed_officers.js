import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load root .env if environment variables are not already set
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

loadEnvFile();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const DEFAULT_PASSWORD = process.env.SEED_OFFICER_PASSWORD || 'ChangeMe123!';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY. Configure them in .env before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const OFFICERS = [
  { email: 'admin@example.com', full_name: 'Demo Administrator', badge_number: 'CYB-001', rank: 'Administrator' },
  { email: 'supervisor@example.com', full_name: 'Demo Supervisor', badge_number: 'CYB-002', rank: 'Senior Officer / Supervisor' },
  { email: 'investigator@example.com', full_name: 'Demo Investigator', badge_number: 'CYB-003', rank: 'Investigating Officer' },
  { email: 'legal@example.com', full_name: 'Demo Legal Officer', badge_number: 'CYB-004', rank: 'Legal Officer' },
  { email: 'forensic@example.com', full_name: 'Demo Forensic Expert', badge_number: 'CYB-005', rank: 'Forensic Expert' }
];

async function seedOfficers() {
  console.log('Starting officer seeding process...');

  // 1. Find existing demo user IDs and unlink them from cases
  const demoEmails = OFFICERS.map(o => o.email);
  const { data: usersToWipe, error: queryError } = await supabase
    .from('users')
    .select('id')
    .in('email', demoEmails);

  if (queryError) {
    console.error('Error querying users table (ensure the table exists first):', queryError);
  } else if (usersToWipe && usersToWipe.length > 0) {
    const userIds = usersToWipe.map(u => u.id);
    console.log(`Unlinking ${userIds.length} demo users from existing cases...`);
    const { error: updateError } = await supabase
      .from('cases')
      .update({ user_id: null })
      .in('user_id', userIds);

    if (updateError) {
      console.error('Error unlinking users from cases:', updateError);
    }
  }

  // 2. Create auth users and upsert profiles
  for (const officer of OFFICERS) {
    console.log(`Processing ${officer.email}...`);

    const { error: signUpError } = await supabase.auth.signUp({
      email: officer.email,
      password: DEFAULT_PASSWORD,
    });

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        console.log(`User ${officer.email} already exists in auth.users. Logging in...`);
        await supabase.auth.signInWithPassword({
          email: officer.email,
          password: DEFAULT_PASSWORD,
        });
      } else {
        console.error(`Failed to sign up ${officer.email}:`, signUpError);
        continue;
      }
    } else {
      console.log(`Successfully signed up ${officer.email} in auth.users.`);
    }

    const profilePayload = {
      email: officer.email,
      full_name: officer.full_name,
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

    await supabase.auth.signOut();
  }

  console.log('Officer seeding complete!');
}

seedOfficers();
