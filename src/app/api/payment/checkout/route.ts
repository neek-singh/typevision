import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planTitle, price, userId, userEmail, userName } = body;

    if (!planTitle || !price || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isProduction = process.env.CASHFREE_ENV === 'production';
    const host = isProduction ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';

    if (!appId || !secretKey) {
      return NextResponse.json({ error: 'Cashfree API keys are not configured' }, { status: 500 });
    }

    // Generate a secure unique order ID
    // Cashfree order_id has maximum 45 characters and supports a-z, A-Z, 0-9, - and _
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const orderId = `cf_${Date.now()}_${sanitizedUserId}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const payload = {
      order_amount: parseFloat(price.replace(/[^0-9.]/g, '')), // Strip currency symbol like ₹
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: userId.slice(0, 45).replace(/[^a-zA-Z0-9_\-]/g, ''),
        customer_phone: '9999999999', // cashfree requires a 10 digit phone number
        customer_email: userEmail,
        customer_name: userName || 'Typist'
      },
      order_meta: {
        return_url: `${appUrl}/api/payment/verify?order_id={order_id}`
      },
      order_tags: {
        user_id: userId,
        plan_title: planTitle
      }
    };

    const response = await fetch(`${host}/pg/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Cashfree Checkout Error Response]:', data);
      return NextResponse.json({ error: data.message || 'Failed to create Cashfree order' }, { status: response.status });
    }

    return NextResponse.json({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id
    });
  } catch (error: any) {
    console.error('[Checkout Route Server Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
