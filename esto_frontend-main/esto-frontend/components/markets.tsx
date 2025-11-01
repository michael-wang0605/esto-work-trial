import { Card } from "@/components/ui/card"
import { Building2, Store, Home, GraduationCap, Warehouse, Users } from "lucide-react"

export function Markets() {
  const markets = [
    {
      icon: Building2,
      title: "Multifamily",
      description: "Comprehensive solutions for apartment communities of all sizes.",
    },
    {
      icon: Store,
      title: "Commercial",
      description: "Streamline operations for office, retail, and mixed-use properties.",
    },
    {
      icon: Home,
      title: "Affordable Housing",
      description: "Specialized tools for compliance and subsidy management.",
    },
    {
      icon: GraduationCap,
      title: "Student Housing",
      description: "Purpose-built features for university and student communities.",
    },
    {
      icon: Warehouse,
      title: "Self Storage",
      description: "Optimize facility operations and maximize occupancy rates.",
    },
    {
      icon: Users,
      title: "Senior Living",
      description: "Integrated care and property management for senior communities.",
    },
  ]

  return (
    <section className="py-16 sm:py-20" id="markets">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left side - Sticky heading */}
          <div className="lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Markets we serve
            </h2>
            <p className="text-pretty text-base leading-relaxed text-foreground/70">
              Discover what the right property management tools can do to transform your business.
            </p>
          </div>

          {/* Right side - Scrollable cards */}
          <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {markets.map((market, index) => (
              <Card
                key={index}
                className="group p-6 transition-all hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <market.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{market.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{market.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
