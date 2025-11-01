"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AuthNav() {
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="glass rounded-[19px] px-3 py-1.5 text-sm">
        <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show profile when authenticated
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 rounded-[19px] glass px-3 py-1.5 text-sm hover:bg-card/60 transition-colors"
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "Profile"}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center">
              <span className="text-xs text-slate-600 font-medium">
                {session.user.name?.[0] || session.user.email?.[0] || "U"}
              </span>
            </div>
          )}
          <span className="hidden sm:inline">{session.user.name || "Profile"}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl glass-strong shadow-2xl py-2 z-50">
            {/* Profile Info */}
            <div className="px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm text-primary font-medium">
                      {session.user.name?.[0] || session.user.email?.[0] || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{session.user.name || "User"}</p>
                  <p className="text-sm text-foreground/60">{session.user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="py-1">

              
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-card/60 transition-colors rounded-lg mx-2"
                onClick={() => setIsProfileOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Settings
              </Link>

              {/* Admin Link - Only show for specific emails */}
              {session.user.email === "esto@gmail.com" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-card/60 transition-colors rounded-lg mx-2"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Admin Panel
                </Link>
              )}


            </div>

            {/* Sign Out */}
            <div className="border-t border-border/50 pt-1">
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setIsProfileOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-lg mx-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  // Show sign in button when not authenticated
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth"
        className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/auth"
        className="rounded-[19px] bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
      >
        Get Started
      </Link>
    </div>
  );
}
