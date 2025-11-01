"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";
import { AnimatedBackground } from "@/components/AnimatedBackground";

// Logo component
function Logo() {
  return (
    <div className="relative h-16 w-48 flex items-center">
      <img 
        src="/esto-logo.png" 
        alt="Esto" 
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

interface BetaSignupForm {
  name: string;
  email: string;
  location: string;
  estimatedAssets: string;
  companyName: string;
  role: string;
  additionalInfo: string;
}

export default function BetaSignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<BetaSignupForm>({
    name: "",
    email: "",
    location: "",
    estimatedAssets: "",
    companyName: "",
    role: "",
    additionalInfo: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth");
             } else {
           // Pre-fill with session data
           setForm(prev => ({
             ...prev,
             name: session.user?.name || "",
             email: session.user?.email || "",
           }));
         }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen w-full text-slate-900 bg-white relative overflow-clip flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session?.user) {
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.estimatedAssets.trim()) newErrors.estimatedAssets = "Estimated assets is required";
    if (!form.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/beta-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }
      
      setSubmitted(true);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background relative overflow-clip">
        <AnimatedBackground />

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
          <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Logo />
              </Link>
              <AuthNav />
            </div>
          </nav>
        </header>

        {/* Success Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-28">
          <div className="glass-strong rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-4">
              Application Submitted!
            </h1>
            
            <p className="text-foreground/70 text-lg mb-8">
              Thank you for your interest in Esto's closed beta. We'll review your application and get back to you within 48 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-[19px] font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-clip">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Logo />
            </Link>
            <AuthNav />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-28">
        <div className="glass-strong rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-4">
              Join Closed Beta
            </h1>
            <p className="text-foreground/70 text-lg">
              Help us shape the future of AI-powered property management
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 glass rounded-[19px] bg-input text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                  errors.name ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-3 glass rounded-[19px] bg-input text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-red-300'
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                className={`w-full px-4 py-3 glass rounded-[19px] bg-input text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                  errors.companyName ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter your company name"
              />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Your Role *
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                className={`w-full px-4 py-3 glass rounded-[19px] bg-input text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                  errors.role ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="e.g., Property Manager, Portfolio Manager, Operations Director"
              />
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Primary Market/Location *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                className={`w-full px-4 py-3 glass rounded-[19px] bg-input text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                  errors.location ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="e.g., Austin, TX or New York Metro Area"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Estimated Assets */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Estimated Assets Under Management *
              </label>
              <select
                value={form.estimatedAssets}
                onChange={(e) => setForm(prev => ({ ...prev, estimatedAssets: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl bg-white/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.estimatedAssets ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Select a range</option>
                <option value="under-1m">Under $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m-10m">$5M - $10M</option>
                <option value="10m-25m">$10M - $25M</option>
                <option value="25m-50m">$25M - $50M</option>
                <option value="50m-100m">$50M - $100M</option>
                <option value="100m-500m">$100M - $500M</option>
                <option value="over-500m">Over $500M</option>
              </select>
              {errors.estimatedAssets && <p className="text-red-500 text-sm mt-1">{errors.estimatedAssets}</p>}
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Additional Information
              </label>
              <textarea
                value={form.additionalInfo}
                onChange={(e) => setForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/80 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tell us about your current challenges, specific use cases, or any other relevant information..."
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-red-500 text-sm text-center">{errors.submit}</div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-[19px] font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-foreground/60">
              Questions? Contact us at{" "}
              <a href="mailto:esto@gmail.com" className="text-primary hover:text-primary/90 font-medium">
                esto@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
