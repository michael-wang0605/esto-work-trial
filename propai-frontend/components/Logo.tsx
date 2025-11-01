interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 64, className = "" }: LogoProps) {
  return (
    <div className={`relative flex items-center ${className}`} style={{ height: size }}>
      <img 
        src="/esto-logo.png" 
        alt="Esto" 
        className="h-full w-auto object-contain"
        style={{ height: size }}
      />
    </div>
  );
}
