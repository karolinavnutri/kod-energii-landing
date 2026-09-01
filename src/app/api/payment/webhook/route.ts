import { NextRequest, NextResponse } from 'next/server';
import { TIERS, isTierId } from '@/lib/pricing';
import { recordOrder } from '@/lib/orders';

export const runtime = 'nodejs';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

const FROM_ADDRESS = 'Код Энергии <noreply@energy-code.ru>';

export async function POST(request: NextRequest) {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    console.error('Payment webhook received but YooKassa is not configured yet');
    // Nothing we can do until real credentials are set; ack so YooKassa doesn't retry forever.
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const paymentId = (body as { object?: { id?: unknown } } | null)?.object?.id;
  if (typeof paymentId !== 'string' || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  // Same trust model as the marathon's webhook: the POST body itself proves nothing (YooKassa's
  // basic webhook integration is unsigned) — re-fetch the payment from YooKassa's API with our
  // own shopId/secretKey and only trust that authenticated response.
  const basicAuth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
  let verifyResponse: Response;
  try {
    verifyResponse = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${basicAuth}` },
    });
  } catch (error) {
    console.error('Failed to verify YooKassa payment', error);
    return NextResponse.json({ error: 'verify_failed' }, { status: 502 }); // let YooKassa retry
  }

  if (!verifyResponse.ok) {
    console.error('YooKassa payment verification returned', verifyResponse.status);
    return NextResponse.json({ error: 'verify_failed' }, { status: 502 }); // let YooKassa retry
  }

  const payment = (await verifyResponse.json()) as {
    status?: string;
    paid?: boolean;
    amount?: { value?: string };
    metadata?: { tier?: string; email?: string };
  };

  if (payment.status !== 'succeeded' || payment.paid !== true) {
    return NextResponse.json({ ok: true });
  }

  const tier = payment.metadata?.tier;
  const email = payment.metadata?.email ?? null;
  if (typeof tier !== 'string' || !isTierId(tier)) {
    console.error('YooKassa payment succeeded without a valid tier in metadata', paymentId);
    return NextResponse.json({ ok: true });
  }

  const amountRub = Number(payment.amount?.value ?? '0');

  const result = await recordOrder({ tier, amountRub, paymentId, email });
  if (!result.ok) {
    // Let YooKassa retry — we want the order recorded (it's how the "Персональный" seat
    // counter stays accurate) before we ack.
    return NextResponse.json({ error: result.reason }, { status: 500 });
  }

  await notifyNewOrder({ tier, amountRub, email, paymentId });

  return NextResponse.json({ ok: true });
}

async function notifyNewOrder(params: { tier: string; amountRub: number; email: string | null; paymentId: string }) {
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    console.error('Order recorded but notification email is not configured (RESEND_API_KEY / NOTIFY_EMAIL)');
    return;
  }
  const tierName = isTierId(params.tier) ? TIERS[params.tier].name : params.tier;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: NOTIFY_EMAIL,
        subject: `Новая оплата: «${tierName}», ${params.amountRub} ₽`,
        html:
          `<p>Пришла новая оплата курса «Код Энергии».</p>` +
          `<ul>` +
          `<li>Тариф: ${tierName}</li>` +
          `<li>Сумма: ${params.amountRub} ₽</li>` +
          `<li>Email покупателя: ${params.email ?? 'не указан'}</li>` +
          `<li>ID платежа в ЮKassa: ${params.paymentId}</li>` +
          `</ul>` +
          `<p>Нужно вручную добавить этого человека в GetCourse.</p>`,
      }),
    });
    if (!response.ok) {
      console.error('Resend API error', response.status, await response.text());
    }
  } catch (error) {
    console.error('Failed to send order notification email via Resend', error);
  }
}
