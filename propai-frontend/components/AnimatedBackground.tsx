"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Large gradient orbs - Esto style */}
      <div className="absolute -left-64 top-32 h-[800px] w-[800px] gradient-orb-blue animate-pulse-slow" />
      <div className="absolute -right-64 top-64 h-[700px] w-[700px] gradient-orb-purple animate-pulse-slower" />
      <div className="absolute left-1/3 top-1/2 h-[900px] w-[900px] gradient-orb-cyan animate-pulse-slow" />

      {/* Accent orbs */}
      <div className="absolute left-1/4 bottom-32 h-[500px] w-[500px] gradient-orb-blue opacity-50 animate-pulse-slower" />
      <div className="absolute right-1/3 top-1/3 h-[600px] w-[600px] gradient-orb-purple opacity-40 animate-pulse-slow" />
      <div className="absolute left-2/3 bottom-1/4 h-[550px] w-[550px] gradient-orb-cyan opacity-45 animate-pulse-slower" />
    </div>
  );
}

