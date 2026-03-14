"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("SEEKER");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("role", role);
    const result = await registerUser(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/auth/login?registered=true");
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-2">Create Account</h1>
      <p className="text-white/40 text-sm mb-8">Join the ACP community</p>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            I want to
          </label>
          <div className="flex gap-2">
            {[
              { id: "SEEKER", label: "Find Work" },
              { id: "POSTER", label: "Hire Talent" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  "flex-1 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all",
                  role === r.id
                    ? "bg-primary text-white"
                    : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"
                )}
                style={role === r.id ? { clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)" } : undefined}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="input-field"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="input-field"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            className="input-field"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
          />
        </div>

        {error && <div className="text-danger text-xs font-bold">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-center disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-white/40">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline font-bold">
          Sign in
        </Link>
      </div>
    </div>
  );
}
