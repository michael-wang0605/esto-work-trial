import { Card } from "@/components/ui/card"
import { Quote } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "Esto has transformed how we manage our 2,500+ unit portfolio. The AI automation has reduced our operational costs by 40% while improving tenant satisfaction.",
      author: "Sarah Chen",
      role: "VP of Operations",
      company: "Metro Property Group",
    },
    {
      quote:
        "The financial intelligence features give us insights we never had before. We can now predict maintenance issues and optimize our budget allocation with confidence.",
      author: "Michael Rodriguez",
      role: "Portfolio Manager",
      company: "Skyline Real Estate",
    },
    {
      quote:
        "Implementation was seamless and the support team is outstanding. We went from legacy systems to fully automated operations in just 6 weeks.",
      author: "Jennifer Park",
      role: "Director of Technology",
      company: "Urban Living Communities",
    },
  ]

  return (
    <section className="py-16 sm:py-20 relative" id="customers">
      {/* Background orb for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] gradient-orb-purple opacity-30" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left side - Sticky heading */}
          <div className="lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Trusted by industry leaders
            </h2>
            <p className="text-pretty text-base leading-relaxed text-foreground/70">
              See how our customers transform their businesses with our solutions.
            </p>
          </div>

          {/* Right side - Scrollable cards */}
          <div className="lg:w-3/5 flex flex-col gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 transition-all hover:scale-[1.02] hover:shadow-2xl">
                <Quote className="mb-4 h-8 w-8 text-primary/40" />
                <p className="mb-4 text-sm leading-relaxed text-foreground/70">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-xs text-foreground/60">{testimonial.role}</p>
                  <p className="text-xs text-foreground/60">{testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
