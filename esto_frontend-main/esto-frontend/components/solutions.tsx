import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  Users,
  TrendingUp,
} from "lucide-react";

export function Solutions() {
  const solutions = [
    {
      icon: Building2,
      title: "Property Managers",
      description:
        "Streamline operations for portfolios of any size with automation and AI-powered insights.",
      features: [
        "Portfolio dashboard",
        "Automated workflows",
        "Tenant screening",
        "Lease management",
      ],
    },
    {
      icon: Users,
      title: "Real Estate Investors",
      description:
        "Maximize ROI with real-time analytics, financial forecasting, and automated rent collection.",
      features: [
        "ROI tracking",
        "Financial reports",
        "Cash flow analysis",
        "Market insights",
      ],
    },
    {
      icon: TrendingUp,
      title: "Enterprise Teams",
      description:
        "Scale your operations with enterprise-grade security, compliance tools, and dedicated support.",
      features: [
        "Custom integrations",
        "SSO & security",
        "Advanced analytics",
        "Priority support",
      ],
    },
  ];

  return (
    <section className="py-16 sm:py-20" id="solutions">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left side - Sticky heading */}
          <div className="lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Complete solutions for property management
            </h2>
            <p className="text-pretty text-base leading-relaxed text-foreground/70">
              Technology for all real estate professionals. Join thousands of businesses worldwide that choose Esto.
            </p>
          </div>

          {/* Right side - Scrollable cards */}
          <div className="lg:w-3/5 flex flex-col gap-6">
            {solutions.map((solution, index) => (
              <Card
                key={index}
                className="p-6 transition-all hover:scale-[1.02] hover:shadow-2xl group">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <solution.icon className="h-7 w-7 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 hover:bg-card/40 text-primary">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="mb-3 text-2xl font-semibold">{solution.title}</h3>
                <p className="mb-5 text-base leading-relaxed text-foreground/70">
                  {solution.description}
                </p>
                <ul className="grid grid-cols-2 gap-2">
                  {solution.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-foreground/70">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
