import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!orderId) {
      return NextResponse.redirect(`${appUrl}/pricing?payment=failed&reason=missing_order_id`);
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isProduction = process.env.CASHFREE_ENV === 'production';
    const host = isProduction ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';

    if (!appId || !secretKey) {
      console.error('[Cashfree Verification Error]: API keys are not configured inside env variables');
      return NextResponse.redirect(`${appUrl}/pricing?payment=failed&reason=configuration_error`);
    }

    // Call Cashfree API to verify payment status
    const response = await fetch(`${host}/pg/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Cashfree Verification API Error]:', errorData);
      return NextResponse.redirect(`${appUrl}/pricing?payment=failed&reason=api_verification_failed`);
    }

    const data = await response.json();

    if (data.order_status === 'PAID') {
      const userId = data.order_tags?.user_id;
      const planTitle = data.order_tags?.plan_title;

      if (!userId || !planTitle) {
        console.error('[Cashfree Verification Payload Error]: Missing user_id or plan_title in order tags', data.order_tags);
        return NextResponse.redirect(`${appUrl}/pricing?payment=failed&reason=invalid_tags`);
      }

      // Securely update database using admin client (bypasses RLS)
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .update({
          subscription_plan: planTitle,
          subscription_status: 'active'
        })
        .eq('id', userId);

      if (dbError) {
        console.error('[Database Update Error]: Failed to update user subscription status:', dbError);
        // Fallback: Redirect to dashboard showing a sync error
        return NextResponse.redirect(`${appUrl}/dashboard?tab=subscription&payment=db_sync_error&plan=${encodeURIComponent(planTitle)}`);
      }

      // Redirect user back to subscription tab in dashboard with success queries
      return NextResponse.redirect(`${appUrl}/dashboard?tab=subscription&payment=success&plan=${encodeURIComponent(planTitle)}`);
    } else {
      console.warn(`[Payment Warning]: Order ${orderId} was not paid. Status: ${data.order_status}`);
      return NextResponse.redirect(`${appUrl}/pricing?payment=failed&status=${data.order_status}`);
    }
  } catch (error: any) {
    console.error('[Payment Verification Route Error]:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/pricing?payment=failed&reason=server_error`);
  }
}
