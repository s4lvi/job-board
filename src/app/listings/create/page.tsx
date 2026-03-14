"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/actions/listing.actions";
import { cn } from "@/lib/utils";

const listingTypes = [
  { id: "JOB", label: "Job", desc: "Full-time or part-time position", icon: "💼" },
  { id: "GIG", label: "Gig", desc: "Short-term freelance work", icon: "⚡" },
  { id: "BOUNTY", label: "Bounty", desc: "One-time project or task", icon: "🎯" },
];

export default function CreateListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "",
    title: "",
    description: "",
    budgetType: "fixed",
    budgetFixed: "",
    budgetMin: "",
    budgetMax: "",
    location: "",
    isRemote: false,
    deadline: "",
    categoryId: "",
    tags: "",
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.set(key, String(value));
    });

    const result = await createListing(formData);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    } else if (result?.listingId) {
      router.push(`/listings/${result.listingId}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
          Create
        </span>
        <h1 className="text-3xl md:text-4xl mt-2">Post an Opportunity</h1>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 transition-colors",
              s <= step ? "bg-primary" : "bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Step 1: Type */}
      {step === 1 && (
        <div>
          <h2 className="text-lg mb-6">What type of opportunity?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {listingTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => { update("type", t.id); setStep(2); }}
                className={cn(
                  "border p-6 text-left transition-all card-cut",
                  form.type === t.id
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <div className="text-3xl mb-3">{t.icon}</div>
                <h3 className="text-sm mb-1">{t.label}</h3>
                <p className="text-white/40 text-xs">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg mb-6">Details</h2>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="input-field"
              placeholder="e.g. Build a React Dashboard"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={8}
              className="input-field resize-none"
              placeholder="Describe the work in detail..."
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
              Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              className="input-field"
              placeholder="react, typescript, frontend (comma separated)"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!form.title || !form.description}
              className="btn-primary disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Location & Budget */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg mb-6">Location & Budget</h2>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="input-field"
                placeholder="e.g. Detroit, MI"
                disabled={form.isRemote}
              />
            </div>
            <div className="pt-7">
              <button
                type="button"
                onClick={() => update("isRemote", !form.isRemote)}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-3 border transition-colors",
                  form.isRemote ? "border-primary text-primary bg-primary/10" : "border-white/10 text-white/40"
                )}
              >
                Remote
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
              Budget Type
            </label>
            <div className="flex gap-2">
              {["fixed", "range"].map((bt) => (
                <button
                  key={bt}
                  onClick={() => update("budgetType", bt)}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors",
                    form.budgetType === bt ? "bg-primary text-white" : "border border-white/10 text-white/40"
                  )}
                  style={form.budgetType === bt ? { clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)" } : undefined}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {form.budgetType === "fixed" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                value={form.budgetFixed}
                onChange={(e) => update("budgetFixed", e.target.value)}
                className="input-field"
                placeholder="1000"
                min="0"
              />
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">Min ($)</label>
                <input type="number" value={form.budgetMin} onChange={(e) => update("budgetMin", e.target.value)} className="input-field" placeholder="500" min="0" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">Max ($)</label>
                <input type="number" value={form.budgetMax} onChange={(e) => update("budgetMax", e.target.value)} className="input-field" placeholder="2000" min="0" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep(2)} className="btn-ghost">Back</button>
            <button onClick={() => setStep(4)} className="btn-primary">Continue</button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg mb-6">Review & Publish</h2>

          <div className="border border-white/5 bg-surface p-6 card-cut space-y-4">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5",
                form.type === "JOB" ? "bg-primary/20 text-primary" :
                form.type === "GIG" ? "bg-accent/20 text-accent" :
                "bg-success/20 text-success"
              )}>
                {form.type}
              </span>
            </div>

            <h3 className="text-xl font-black uppercase tracking-wider">{form.title}</h3>

            <p className="text-white/50 text-sm whitespace-pre-wrap">{form.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-white/40 pt-4 border-t border-white/5">
              {form.budgetFixed && <span className="text-accent font-bold">${form.budgetFixed}</span>}
              {form.budgetMin && form.budgetMax && <span className="text-accent font-bold">${form.budgetMin} - ${form.budgetMax}</span>}
              {form.isRemote && <span>Remote</span>}
              {form.location && !form.isRemote && <span>{form.location}</span>}
              {form.deadline && <span>Due {form.deadline}</span>}
            </div>

            {form.tags && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.split(",").map((tag) => (
                  <span key={tag.trim()} className="text-[10px] text-white/30 border border-white/10 px-2 py-0.5 uppercase tracking-wider">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <div className="text-danger text-sm font-bold">{error}</div>}

          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep(3)} className="btn-ghost">Back</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-accent disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
