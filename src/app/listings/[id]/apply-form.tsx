"use client";

import { useState } from "react";
import { submitApplication } from "@/lib/actions/application.actions";

export default function ApplyForm({
  listingId,
  listingType,
}: {
  listingId: string;
  listingType: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    formData.set("listingId", listingId);
    const result = await submitApplication(formData);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit}>
      <h3 className="text-sm mb-4">
        {listingType === "BOUNTY" ? "Submit a Bid" : "Apply Now"}
      </h3>

      {(listingType === "GIG" || listingType === "BOUNTY") && (
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            Your Bid ($)
          </label>
          <input
            type="number"
            name="bidAmount"
            step="0.01"
            min="0"
            className="input-field"
            placeholder="Enter your bid amount"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
          Cover Letter
        </label>
        <textarea
          name="coverLetter"
          rows={5}
          className="input-field resize-none"
          placeholder="Why are you a good fit?"
        />
      </div>

      {error && (
        <div className="text-danger text-xs mb-4 font-bold">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full text-center disabled:opacity-50"
      >
        {submitting ? "Submitting..." : listingType === "BOUNTY" ? "Submit Bid" : "Apply"}
      </button>
    </form>
  );
}
