export function Stats() {
  const stats = [
    {
      value: "67%",
      label:
        "of property management firms use software to streamline operations",
      source: "Resimpli, 2024",
    },
    {
      value: "39%",
      label:
        "of property managers spend over 20 hours/month on maintenance requests",
      source: "Amra & Elma, 2024",
    },
    {
      value: "30%",
      label: "time saved from communications using Esto",
      source: "AppFolio, 2024",
    },
    {
      value: "18%",
      label: "year-over-year increase in online rent payments",
      source: "Amra & Elma, 2024",
    },
  ];

  return (
    <section className="border-y border-border/30 glass py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col group">
              <div className="mb-2 text-4xl font-bold tracking-tight bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mb-1 text-sm text-foreground/70">
                {stat.label}
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-foreground/50">
                {stat.source}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
