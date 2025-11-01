export function VideoDemo() {
  return (
    <section className="py-16 sm:py-20 relative" id="demo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            See Esto in action
          </h2>
          <p className="text-pretty text-base leading-relaxed text-foreground/70">
            Watch a quick demo of how Esto transforms property management
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="glass rounded-3xl overflow-hidden shadow-2xl aspect-video">
            <iframe
              src="https://drive.google.com/file/d/1eaq6OjBWLUhpswEWNpilNphAvYedvxqh/preview"
              className="w-full h-full"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}
