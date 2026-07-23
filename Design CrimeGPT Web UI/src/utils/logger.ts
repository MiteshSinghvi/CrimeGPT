import { supabase } from '@/lib/supabaseClient';

export const logActivity = async (action: string) => {
  try {
    // 1. Get active session user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return;

    const user = session.user;
    // Grab email or fallback to a custom badge ID if stored in user_metadata
    const userIdentifier = user.email || user.user_metadata?.badge_id || 'Unknown Officer';

    // 2. Fetch IP Address safely (fail gracefully if blocked by adblockers)
    let ip_address = 'Unknown IP';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        ip_address = ipData.ip;
      }
    } catch (ipError) {
      console.warn("Could not fetch IP:", ipError);
    }

    // 3. Insert into Supabase
    const { error: insertError } = await supabase.from('audit_logs').insert([{
      user_id: user.id,
      user_email: userIdentifier,
      action,
      ip_address
    }]);

    if (insertError) console.error("Audit log insert failed:", insertError);

  } catch (error) {
    console.error("Critical failure in logActivity:", error);
  }
};
