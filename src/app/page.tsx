import { CourseLanding } from '@/components/course-landing';
import { DISCOUNT_DEADLINE_ISO } from '@/lib/pricing';
import { remainingSeats } from '@/lib/orders';

export const revalidate = 0;

export default async function Page() {
  const discountActive = new Date() <= new Date(DISCOUNT_DEADLINE_ISO);
  const personalRemaining = await remainingSeats('personal');

  return <CourseLanding discountActive={discountActive} deadlineISO={DISCOUNT_DEADLINE_ISO} personalRemaining={personalRemaining} />;
}
