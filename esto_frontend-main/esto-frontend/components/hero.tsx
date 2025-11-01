import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
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
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 rounded-[19px] px-8">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto glass hover:bg-card/60 rounded-[19px] px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Gradient Orb Background - Supermemory style */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Large blue orb - top left */}
        <div className="absolute -left-32 top-0 h-[600px] w-[600px] gradient-orb-blue" />

        {/* Purple orb - top right */}
        <div className="absolute -right-32 top-32 h-[500px] w-[500px] gradient-orb-purple" />

        {/* Cyan orb - center */}
        <div className="absolute left-1/2 top-1/4 h-[700px] w-[700px] -translate-x-1/2 gradient-orb-cyan" />

        {/* Smaller accent orbs */}
        <div className="absolute left-1/4 bottom-0 h-[400px] w-[400px] gradient-orb-blue opacity-60" />
        <div className="absolute right-1/4 top-1/2 h-[350px] w-[350px] gradient-orb-purple opacity-50" />
      </div>
    </section>
  )
}
