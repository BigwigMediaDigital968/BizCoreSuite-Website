"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Sign-in failed. Try again.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]">
        <div className="mb-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white font-bold">
            B
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage leads and blog posts.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] text-ink-soft">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] text-ink-soft">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
