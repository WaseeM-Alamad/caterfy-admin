import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service-role client — server only, never exposed to the browser
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const {
      applicationId, email, password,
      ownerName, phone,
      businessType, storeName, storeType,
      reviewedBy, reviewNotes,
    } = await req.json();

    if (!applicationId || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create the Supabase auth user.
    //    The DB trigger (handle_new_user) fires on INSERT into auth.users and
    //    automatically inserts into public.vendors using the metadata below.
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      phone: phone ?? undefined,
      email_confirm: true,
      user_metadata: {
        role: 'vendor',
        name: ownerName,
        business_type: businessType,
        business_name: storeName,
        store_type: storeType,
      },
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes('already registered') ||
          authError.message?.toLowerCase().includes('already exists')) {
        return NextResponse.json({ error: 'A vendor account for this email already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const vendorId = authData.user.id;

    // 2. Update the application: mark approved + store the new vendor_id.
    //    No manual vendors insert needed — the trigger already handled it.
    const { error: appError } = await adminSupabase
      .from('vendor_applications')
      .update({
        status: 'approved',
        vendor_id: vendorId,
        reviewed_by: reviewedBy ?? null,
        review_notes: reviewNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (appError) {
      // Roll back the auth user so we don't end up with an orphaned account
      await adminSupabase.auth.admin.deleteUser(vendorId);
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vendorId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 });
  }
}
