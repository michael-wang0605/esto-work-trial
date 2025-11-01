"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full text-slate-900 bg-white relative overflow-clip">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(900px_600px_at_100%_10%,rgba(147,51,234,0.18),transparent_60%),radial-gradient(700px_600px_at_0%_20%,rgba(16,185,129,0.18),transparent_60%)]"
      />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-300/60 bg-white/90">
        <nav className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-6">
              <div className="relative">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  className="drop-shadow"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="t8g" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="50%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#t8g)"/>
                  <text
                    x="50%"
                    y="52%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
                    fontWeight="800"
                    fontSize="10"
                    fill="#0b1220"
                  >
                    T8
                  </text>
                </svg>
                <span className="text-xl font-semibold tracking-tight">Esto</span>
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 pt-20 pb-28">
        <div className="w-full rounded-2xl border border-slate-300/60 bg-gradient-to-br from-slate-50/80 to-slate-100/60 backdrop-blur-xl shadow-2xl ring-1 ring-slate-300/40 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Terms of Service</h1>
            <p className="text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 mb-6">
              By accessing and using Esto, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 mb-6">
              Esto provides AI-powered messaging services for property managers, including automated rent reminders, 
              maintenance request triage, and tenant communication tools.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">3. User Accounts</h2>
            <p className="text-slate-600 mb-6">
              You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Acceptable Use</h2>
            <p className="text-slate-600 mb-6">
              You agree not to use the service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Privacy</h2>
            <p className="text-slate-600 mb-6">
              Your privacy is important to us. Please review our <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, 
              which also governs your use of the service.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Termination</h2>
            <p className="text-slate-600 mb-6">
              We may terminate or suspend your account and access to the service at any time, with or without cause.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">7. Changes to Terms</h2>
            <p className="text-slate-600 mb-6">
              We reserve the right to modify these terms at any time. We will notify users of any material changes.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">8. Contact Information</h2>
            <p className="text-slate-600 mb-6">
              If you have any questions about these Terms of Service, please contact us.
            </p>
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/auth"
              className="inline-block rounded-xl px-6 py-3 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 text-white font-semibold hover:opacity-95 transition-opacity"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
