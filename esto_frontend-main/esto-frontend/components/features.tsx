import { Card } from "@/components/ui/card"
import { FileText, DollarSign, Wrench, BarChart3 } from "lucide-react"

export function Features() {
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
  ]

  return (
    <section className="py-16 sm:py-20" id="features">
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
              <Card
                key={index}
                className="p-6 transition-all hover:scale-[1.02] hover:shadow-2xl group"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold">{feature.title}</h3>
                <p className="mb-4 text-base leading-relaxed text-foreground/70">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground/60">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
