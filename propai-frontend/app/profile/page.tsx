"use client";

import { useSession } from "next-auth/react";
import Topbar from "@/components/Topbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import AuthWrapper from "@/components/AuthWrapper";
import { User, Mail, Calendar, Shield } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <AnimatedBackground />
        <div className="relative z-10">
          <Topbar />
          
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                Profile
              </h1>
              <p className="text-foreground/70">Manage your account settings and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="max-w-3xl">
              <div className="glass-strong rounded-xl p-8 mb-6">
                <div className="flex items-center gap-6 mb-8">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      className="w-20 h-20 rounded-full ring-4 ring-primary/20"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/10">
                      <span className="text-3xl font-bold text-primary">
                        {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{session.user?.name || "User"}</h2>
                    <p className="text-foreground/60">{session.user?.email}</p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-card/40 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground/70">Full Name</span>
                    </div>
                    <p className="text-foreground pl-8">{session.user?.name || "Not set"}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-card/40 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground/70">Email Address</span>
                    </div>
                    <p className="text-foreground pl-8">{session.user?.email || "Not set"}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-card/40 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground/70">Account Type</span>
                    </div>
                    <p className="text-foreground pl-8">Property Manager</p>
                  </div>

                  <div className="p-4 rounded-xl bg-card/40 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground/70">Member Since</span>
                    </div>
                    <p className="text-foreground pl-8">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="glass-strong rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-xl glass hover:bg-card/60 text-left transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground group-hover:text-primary transition-colors">Change Password</span>
                      <svg className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 rounded-xl glass hover:bg-card/60 text-left transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground group-hover:text-primary transition-colors">Notification Settings</span>
                      <svg className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}
