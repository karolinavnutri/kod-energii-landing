import { createClient } from '@supabase/supabase-js';
import { TIERS, type TierId } from './pricing';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function serviceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Reuses the same Supabase project already set up for the marathon (see 1-2-MVP/product-mvp) —
// just a new table, no auth involved. This is the source of truth an admin can read to know who
// to add to GetCourse by hand, and it's also how the "Персональный" tier's seat counter on the
// landing stays real instead of a hardcoded number.
export async function recordOrder(params: {
  tier: TierId;
  amountRub: number;
  paymentId: string;
  email: string | null;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = serviceClient();
  if (!supabase) return { ok: false, reason: 'not_configured' };

  const { error } = await supabase.from('course_orders').insert({
    tier: params.tier,
    amount_rub: params.amountRub,
    payment_id: params.paymentId,
    email: params.email,
    status: 'succeeded',
  });

  // Unique constraint on payment_id means a retried webhook delivery for the same payment
  // is a harmless no-op, not a duplicate order — treat that specific error as success.
  if (error && error.code !== '23505') {
    console.error('Failed to record course order', error);
    return { ok: false, reason: 'db_error' };
  }
  return { ok: true };
}

export async function countPaidSeats(tier: TierId): Promise<number | null> {
  const supabase = serviceClient();
  if (!supabase) return null;

  const { count, error } = await supabase
    .from('course_orders')
    .select('id', { count: 'exact', head: true })
    .eq('tier', tier)
    .eq('status', 'succeeded');

  if (error) {
    console.error('Failed to count paid seats', error);
    return null;
  }
  return count ?? 0;
}

export async function remainingSeats(tier: TierId): Promise<number | null> {
  const limit = TIERS[tier].seatLimit;
  if (!limit) return null;
  const paid = await countPaidSeats(tier);
  if (paid === null) return null;
  return Math.max(0, limit - paid);
}
