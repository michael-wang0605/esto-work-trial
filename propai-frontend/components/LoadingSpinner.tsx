interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = "md",
  className = ""
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={`min-h-screen w-full bg-background relative overflow-clip flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`${sizeClasses[size]} border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4`}></div>
        <p className="text-foreground/70">{message}</p>
      </div>
    </div>
  );
}
