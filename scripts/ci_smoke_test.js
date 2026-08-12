const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFallback() {
  const env = {};
  try {
    const text = fs.readFileSync('./.env', 'utf8');
    for (const line of text.split(/\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  } catch (e) {
    // ignore
  }
  return env;
}

(async () => {
  const fallback = loadEnvFallback();
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || fallback.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || fallback.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.error('Missing Supabase URL or anon key in env or .env');
    process.exit(2);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  const email = `testuser${Date.now()}@gmail.com`;
  const password = 'Test12345!';

  console.log('Signing up test user', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    console.error('Sign up error:', signUpError.message || signUpError);
    // continue to try to sign in in case user exists
  } else {
    console.log('Sign up response:', signUpData?.user ? 'user created' : 'confirmation required');
  }

  console.log('Signing in');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError || !signInData?.session) {
    console.error('Sign in failed:', signInError?.message || 'no session');
    process.exit(1);
  }

  const token = signInData.session.access_token;
  console.log('Got session token, creating project');

  const authSupabase = createClient(SUPABASE_URL, SUPABASE_ANON, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: insertData, error: insertError } = await authSupabase.from('projects').insert({ user_id: signInData.session.user.id, name: 'CI Smoke Project', client_message: 'Created by smoke test' }).select();
  if (insertError) {
    console.error('Insert error:', insertError.message || insertError);
    process.exit(1);
  }

  console.log('Insert successful:', insertData);
  console.log('Smoke test completed successfully.');
  process.exit(0);
})();
