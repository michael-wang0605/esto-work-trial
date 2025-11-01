"use client";

import AuthNav from "./AuthNav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Building2, MessageSquare, Wrench, Home, FileText, Zap } from "lucide-react";

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

export default function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isAuthenticated = !!session?.user;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
              <Logo />
            </Link>
            
            {/* Navigation Links - Only show when authenticated */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6 ml-8">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname === "/dashboard" 
                      ? "text-foreground" 
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/properties"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname.startsWith("/properties") 
                      ? "text-foreground" 
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Properties
                </Link>
                <Link
                  href="/messages"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname === "/messages" 
                      ? "text-foreground" 
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </Link>
                <Link
                  href="/maintenance"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname === "/maintenance" 
                      ? "text-foreground" 
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Maintenance
                </Link>
                <Link
                  href="/applications"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname.startsWith("/applications") 
                      ? "text-foreground" 
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Applications
                </Link>
                <Link
                  href="/integrations"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname === "/integrations" 
                      ? "text-foreground" 
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Integrations
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Only show Join Closed Beta button when not on beta-signup page and not authenticated */}
            {pathname !== "/beta-signup" && !isAuthenticated && (
              <Link
                href="/beta-signup"
                className="hidden sm:inline-flex text-sm px-4 py-2 rounded-[19px] glass hover:bg-card/60 transition-colors"
              >
                Join Closed Beta
              </Link>
            )}
            <AuthNav />
          </div>
        </div>
      </nav>
    </header>
  );
}
