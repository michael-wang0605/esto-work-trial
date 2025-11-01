// app/auth/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, Suspense, useState } from "react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/AnimatedBackground";

function AuthPageContent() {
  const { data: session, status } = useSession();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (status === "authenticated") {
      if (callbackUrl === "/preview") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = callbackUrl;
      }
    }
  }, [status, callbackUrl]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Signup failed");
        
        await signIn("credentials", { email, password, callbackUrl });
      } else {
        await signIn("credentials", { email, password, callbackUrl });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-clip">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <div className="relative h-16 w-48 flex items-center">
                <img 
                  src="/esto-logo.png" 
                  alt="Esto" 
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-md px-6 pt-32 pb-28">
        <div className="glass-strong rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
              Welcome to Esto
            </h1>
            <p className="text-foreground/70">Sign in or create your account to get started</p>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full rounded-[19px] p-4 glass hover:bg-card/60 transition-colors duration-200 mb-6 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-foreground">Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-card text-foreground/60">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <input
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  required
                  disabled={isLoading}
                  className="w-full glass rounded-[19px] p-4 bg-input text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full glass rounded-[19px] p-4 bg-input text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                disabled={isLoading}
                className="w-full glass rounded-[19px] p-4 bg-input text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full rounded-[19px] p-4 bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="text-xs text-foreground/50 text-center mt-6 leading-relaxed">
            By continuing, you agree to our <Link href="/terms" className="hover:underline text-primary">Terms</Link> & <Link href="/privacy" className="hover:underline text-primary">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/40 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
