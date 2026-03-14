"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser } from "@/lib/actions/auth.actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("callbackUrl", callbackUrl);
    const result = await loginUser(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-2">Sign In</h1>
      <p className="text-white/40 text-sm mb-8">Welcome back to ACP Jobs</p>

      <form action={handleSubmit} className="space-y-5">
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
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <div className="text-danger text-xs font-bold">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-center disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-white/40">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary hover:underline font-bold">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
