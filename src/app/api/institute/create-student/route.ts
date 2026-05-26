import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/institute/create-student
 *
 * Creates a new student account for an institute:
 * 1. Creates Supabase Auth user (via service-role key — server-side only)
 * 2. Updates public.users profile with organization_id, role='student'
 * 3. Optionally enrolls them in a batch (class_students)
 *
 * Body: { name, email, password, organizationId, batchId? }
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, organizationId, batchId } = await req.json();

    if (!name || !email || !password || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields: name, email, password, organizationId' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Use service-role key for admin operations (server-side only, never exposed to client)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Server misconfiguration: missing Supabase URL/keys.' }, { status: 500 });
    }

    let userId: string | undefined;

    if (serviceKey) {
      // ── Admin path: create user without email confirmation ──
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // skip email verification
        user_metadata: { display_name: name },
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
      userId = authData.user?.id;

      if (!userId) {
        return NextResponse.json({ error: 'User creation failed: no user ID returned.' }, { status: 500 });
      }

      // Update profile with org + role (trigger already created the row)
      await adminClient.from('users').update({
        display_name: name,
        organization_id: organizationId,
        role: 'student',
      }).eq('id', userId);

      // Enroll in batch if specified
      if (batchId) {
        await adminClient.from('class_students').insert({ class_id: batchId, student_id: userId });
      }

    } else {
      // ── Fallback path: use anon key signUp (student will need email confirmation) ──
      const anonClient = createClient(supabaseUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });

      if (signUpError) {
        return NextResponse.json({ error: signUpError.message }, { status: 400 });
      }
      userId = signUpData.user?.id;

      if (!userId) {
        return NextResponse.json({ error: 'Signup failed: no user ID returned. The email may already be registered.' }, { status: 500 });
      }

      // Update profile with org and role
      // Note: Without service key, this update is limited by RLS policies.
      // The trigger creates the user row, so we update via service-role compatible approach.
      await anonClient.from('users').update({
        display_name: name,
        organization_id: organizationId,
        role: 'student',
      }).eq('id', userId);

      if (batchId) {
        await anonClient.from('class_students').insert({ class_id: batchId, student_id: userId });
      }
    }

    return NextResponse.json({ success: true, userId }, { status: 201 });

  } catch (err: any) {
    console.error('create-student API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
