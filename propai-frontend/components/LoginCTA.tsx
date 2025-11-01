"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function LoginCTA() {
  const { data: session, status } = useSession();

  // Don't show the CTA if user is authenticated
  if (session?.user) {
    return null;
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="w-full mt-16 rounded-2xl border border-slate-300/60 bg-gradient-to-br from-slate-50/80 to-slate-100/60 backdrop-blur-xl shadow-2xl ring-1 ring-slate-300/40 p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full mt-16 rounded-2xl border border-slate-300/60 bg-gradient-to-br from-slate-50/80 to-slate-100/60 backdrop-blur-xl shadow-2xl ring-1 ring-slate-300/40 p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-slate-800">
          Get access
        </h3>
        <p className="text-slate-600 mt-2 text-lg">
          Create an account to preview the product (invite-only beta).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/auth?next=/preview"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 px-6 py-3 font-medium text-slate-900 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-400/50 hover:opacity-95"
        >
          Create account
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/auth?next=/preview"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-400/60 px-6 py-3 font-medium text-slate-800 hover:bg-slate-50/70 transition focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        >
          Preview (gated)
        </Link>
      </div>

      <p className="text-xs text-slate-500 text-center mt-4">
        We only store your email to manage your account and send important updates.
        <span className="mx-1">•</span>
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
}
