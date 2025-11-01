"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Privacy Policy</h1>
            <p className="text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 mb-6">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 mb-6">
              We use the information we collect to provide, maintain, and improve our services, 
              communicate with you, and ensure the security of our platform.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Data Security</h2>
            <p className="text-slate-600 mb-6">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Cookies and Tracking</h2>
            <p className="text-slate-600 mb-6">
              We use cookies and similar technologies to enhance your experience, 
              analyze usage patterns, and provide personalized content.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Your Rights</h2>
            <p className="text-slate-600 mb-6">
              You have the right to access, update, or delete your personal information. 
              You can also opt out of certain communications and data collection.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">7. Data Retention</h2>
            <p className="text-slate-600 mb-6">
              We retain your personal information for as long as necessary to provide our services 
              and comply with legal obligations.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">8. Changes to This Policy</h2>
            <p className="text-slate-600 mb-6">
              We may update this privacy policy from time to time. We will notify you of any material changes.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">9. Contact Us</h2>
            <p className="text-slate-600 mb-6">
              If you have any questions about this Privacy Policy, please contact us.
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
