import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/badge";

export default async function PaymentSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true, stripeCustomerId: true },
  });

  const hasStripeAccount = !!user?.stripeAccountId;

  return (
    <div>
      <h2 className="text-lg mb-6">Payment Settings</h2>

      {/* Stripe Connect - for receiving payments */}
      <div className="border border-white/5 bg-surface p-6 card-cut mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm">Receive Payments</h3>
          {hasStripeAccount ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="accent">Not Connected</Badge>
          )}
        </div>
        <p className="text-white/40 text-sm mb-4">
          Connect your Stripe account to receive payments when you complete work.
          A 10% platform fee is deducted from each payment.
        </p>
        {hasStripeAccount ? (
          <a href="/api/stripe/dashboard" className="btn-secondary btn-sm">
            Stripe Dashboard
          </a>
        ) : (
          <a href="/api/stripe/connect" className="btn-accent btn-sm">
            Connect with Stripe
          </a>
        )}
      </div>

      {/* Payment Methods - for making payments */}
      <div className="border border-white/5 bg-surface p-6 card-cut">
        <h3 className="text-sm mb-4">Payment Methods</h3>
        <p className="text-white/40 text-sm mb-4">
          Add a payment method to fund escrow for jobs you post.
        </p>
        <p className="text-white/20 text-xs">
          Payment methods are managed securely through Stripe during checkout.
        </p>
      </div>
    </div>
  );
}
