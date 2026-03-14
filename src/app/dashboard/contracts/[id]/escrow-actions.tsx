"use client";

import { useState } from "react";

export default function EscrowActions({
  contractId,
  isPoster,
  contractStatus,
  escrowStatus,
  seekerHasStripe,
}: {
  contractId: string;
  isPoster: boolean;
  contractStatus: string;
  escrowStatus: string | null;
  seekerHasStripe: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (contractStatus !== "ACTIVE") return null;

  async function handleFundEscrow() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // In production, use Stripe Elements to confirm the payment
        // For now, redirect to a payment page or show the client secret
        setError("Stripe Elements integration needed for payment confirmation. Client secret received.");
      }
    } catch {
      setError("Failed to create payment");
    }
    setLoading(false);
  }

  async function handleReleaseFunds() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/release-escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
    } catch {
      setError("Failed to release funds");
    }
    setLoading(false);
  }

  return (
    <div className="border border-white/5 bg-surface p-6 card-cut">
      <h3 className="text-sm mb-4">Escrow Actions</h3>

      {error && <div className="text-danger text-xs font-bold mb-4">{error}</div>}

      {isPoster && !escrowStatus && (
        <div>
          {seekerHasStripe ? (
            <button onClick={handleFundEscrow} disabled={loading} className="btn-accent w-full text-center disabled:opacity-50">
              {loading ? "Processing..." : "Fund Escrow"}
            </button>
          ) : (
            <p className="text-white/40 text-sm">Worker needs to connect Stripe before escrow can be funded.</p>
          )}
        </div>
      )}

      {isPoster && escrowStatus === "PENDING" && (
        <button onClick={handleFundEscrow} disabled={loading} className="btn-accent w-full text-center disabled:opacity-50">
          {loading ? "Processing..." : "Complete Payment"}
        </button>
      )}

      {isPoster && escrowStatus === "FUNDED" && (
        <div className="space-y-3">
          <p className="text-success text-xs font-bold mb-2">Escrow funded — release when work is complete</p>
          <button onClick={handleReleaseFunds} disabled={loading} className="btn-primary w-full text-center disabled:opacity-50">
            {loading ? "Releasing..." : "Release Funds"}
          </button>
        </div>
      )}

      {!isPoster && escrowStatus === "FUNDED" && (
        <p className="text-success text-xs font-bold">Escrow funded — funds will be released when work is approved</p>
      )}

      {escrowStatus === "RELEASED" && (
        <p className="text-primary text-xs font-bold">Funds have been released</p>
      )}
    </div>
  );
}
