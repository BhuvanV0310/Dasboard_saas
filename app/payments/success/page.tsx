import PaymentSuccessClient from './PaymentSuccessClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  // Server component that delegates the interactive parts to a client component
  return <PaymentSuccessClient />;
}
