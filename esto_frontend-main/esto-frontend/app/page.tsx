import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Stats } from "@/components/stats";
import { Solutions } from "@/components/solutions";
import { Testimonials } from "@/components/testimonials";
import { CTA } from "@/components/cta";
import { VideoDemo } from "@/components/video-demo";
import { AnimatedBackground } from "@/components/animated-background";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />
        <Hero />
        <Stats />
        <Solutions />
        <Features />
        <Testimonials />
        <VideoDemo />
        <CTA />
      </div>
    </main>
  );
}
