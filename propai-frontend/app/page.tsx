"use client";

import Topbar from "@/components/Topbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, FileText, DollarSign, Wrench, BarChart3, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function EstoLanding() {
  return (
    <main className="min-h-screen bg-background relative">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Topbar />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-foreground/90">Introducing the AI Operating System for Property Management</span>
              </div>

              <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                The complete platform to manage properties.
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/70 sm:text-xl">
                Automate rent collection, maintenance requests, and tenant communication while transforming your real estate
                data into actionable financial intelligence.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 rounded-[19px] px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto glass hover:bg-card/60 rounded-[19px] px-8">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="glass-strong rounded-xl p-6">
                <div className="text-4xl font-bold text-primary mb-2">$20M+</div>
                <div className="text-foreground/70">Assets Under Management</div>
              </div>
              <div className="glass-strong rounded-xl p-6">
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <div className="text-foreground/70">Active Markets</div>
              </div>
              <div className="glass-strong rounded-xl p-6">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-foreground/70">AI Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20" id="features">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Left side - Sticky heading */}
              <div className="lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
                <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Everything you need to manage properties
                </h2>
                <p className="text-pretty text-base leading-relaxed text-foreground/70">
                  A complete AI-powered platform designed for modern property management teams.
                </p>
              </div>

              {/* Right side - 2x2 grid */}
              <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="glass-strong p-6 rounded-xl transition-all hover:scale-[1.02] hover:shadow-2xl group"
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold">{feature.title}</h3>
                    <p className="mb-4 text-base leading-relaxed text-foreground/70">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/60">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-strong rounded-2xl p-12 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to transform your property management?
              </h2>
              <p className="text-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of property managers who have already automated their operations with Esto.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-[19px] px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/beta-signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto glass hover:bg-card/60 rounded-[19px] px-8">
                    Join Closed Beta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="relative h-16 w-48 flex items-center">
                  <img 
                    src="/esto-logo.png" 
                    alt="Esto" 
                    className="h-full w-auto object-contain"
                  />
                </div>
              </div>
              <div className="flex gap-6 text-sm text-foreground/60">
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/beta-signup" className="hover:text-foreground transition-colors">Contact</Link>
              </div>
              <div className="text-sm text-foreground/60">
                © {new Date().getFullYear()} Esto. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

const features = [
  {
    icon: FileText,
    title: "Lease Management",
    description: "Digital lease signing, renewal automation, and compliance tracking.",
    bullets: [
      "E-signatures & document vault",
      "Auto-renewals & alerts",
      "Compliance tracking"
    ]
  },
  {
    icon: DollarSign,
    title: "Rent Automation",
    description: "Automate rent collection, late fees, and payment processing with intelligent reminders.",
    bullets: [
      "Online payments & auto-reminders",
      "Payment plans & reconciliation",
      "Late fee automation"
    ]
  },
  {
    icon: Wrench,
    title: "Maintenance + Communication",
    description: "AI-powered work orders and unified tenant communication platform.",
    bullets: [
      "Smart routing & vendor portal",
      "Email, SMS & in-app messaging",
      "AI-assisted responses"
    ]
  },
  {
    icon: BarChart3,
    title: "Accounting + Compliance",
    description: "Real-time financial analytics with automated compliance monitoring.",
    bullets: [
      "Live dashboards & forecasting",
      "Bank-level security (SOC 2)",
      "Automated audit trails"
    ]
  },
];
