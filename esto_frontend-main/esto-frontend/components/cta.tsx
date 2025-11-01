import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl glass">
          <div className="relative z-10 px-8 py-16 text-center sm:px-16 sm:py-24">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Ready to transform your property management?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/70">
              Join leading property managers who are saving time and increasing revenue with Esto's AI-powered platform.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 rounded-[19px] px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto glass hover:bg-card/60 rounded-[19px] px-8">
                Schedule Demo
              </Button>
            </div>
          </div>

          {/* Background decoration with gradient orbs */}
          <div className="absolute inset-0 -z-0 overflow-hidden">
            <div className="absolute right-0 top-0 h-96 w-96 gradient-orb-cyan opacity-40" />
            <div className="absolute bottom-0 left-0 h-96 w-96 gradient-orb-blue opacity-40" />
          </div>
        </div>
      </div>
    </section>
  )
}
