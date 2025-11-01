"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
              <span className="font-mono text-sm font-bold text-primary-foreground">
                E
              </span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Esto</span>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("solutions")}
              onMouseLeave={() => setOpenDropdown(null)}>
              <button className="flex items-center gap-1 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
                Solutions
                <ChevronDown className="h-4 w-4" />
              </button>
              {openDropdown === "solutions" && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-xl glass-strong p-2 shadow-2xl">
                  <a
                    href="#automation"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-card/60 transition-colors">
                    Rent Automation
                  </a>
                  <a
                    href="#maintenance"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-card/60 transition-colors">
                    Maintenance Management
                  </a>
                  <a
                    href="#communication"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-card/60 transition-colors">
                    Tenant Communication
                  </a>
                  <a
                    href="#analytics"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-card/60 transition-colors">
                    Financial Analytics
                  </a>
                </div>
              )}
            </div>

            <a
              href="#customers"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Customers
            </a>
            <a
              href="#resources"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Resources
            </a>
            <a
              href="#company"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Company
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex hover:bg-card/40">
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-[19px] px-6">
              Talk to Sales
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
