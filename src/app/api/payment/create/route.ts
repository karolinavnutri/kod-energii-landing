import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { DISCOUNT_DEADLINE_ISO, TIERS, isTierId } from '@/lib/pricing';
import { remainingSeats } from '@/lib/orders';

export const runtime = 'nodejs';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const tier = (body as { tier?: unknown } | null)?.tier;
  const email = (body as { email?: unknown } | null)?.email;

  if (typeof tier !== 'string' || !isTierId(tier)) {
    return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  if (TIERS[tier].seatLimit) {
    const remaining = await remainingSeats(tier);
    if (remaining !== null && remaining <= 0) {
      return NextResponse.json({ error: 'sold_out' }, { status: 409 });
    }
  }

  // Price is decided here, server-side, from today's date — never trust a price the
  // client might send, since that's an easy way to pay less than intended.
  const discountActive = new Date() <= new Date(DISCOUNT_DEADLINE_ISO);
  const priceRub = discountActive ? TIERS[tier].discountPriceRub : TIERS[tier].normalPriceRub;

  const returnUrl = `${request.nextUrl.origin}/?payment=return`;
  const basicAuth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

  let response: Response;
  try {
    response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': randomUUID(),
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: { value: priceRub.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: returnUrl },
        description: `Курс «Код Энергии», тариф «${TIERS[tier].name}»`,
        metadata: { tier, email },
      }),
    });
  } catch (error) {
    console.error('YooKassa create-payment request failed', error);
    return NextResponse.json({ error: 'yookassa_error' }, { status: 502 });
  }

  if (!response.ok) {
    console.error('YooKassa create-payment error', response.status, await response.text());
    return NextResponse.json({ error: 'yookassa_error' }, { status: 502 });
  }

  const payment = (await response.json()) as { confirmation?: { confirmation_url?: string } };
  const confirmationUrl = payment.confirmation?.confirmation_url;
  if (!confirmationUrl) {
    console.error('YooKassa create-payment response missing confirmation_url', payment);
    return NextResponse.json({ error: 'yookassa_error' }, { status: 502 });
  }

  return NextResponse.json({ confirmationUrl });
}
