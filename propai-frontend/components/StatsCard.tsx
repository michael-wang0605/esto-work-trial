import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string | ReactNode;
  icon: ReactNode;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "gray";
  className?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = "blue",
  className = ""
}: StatsCardProps) {
  const colorClasses = {
    blue: "text-primary bg-primary/10",
    green: "text-green-400 bg-green-400/10", 
    orange: "text-orange-400 bg-orange-400/10",
    red: "text-destructive bg-destructive/10",
    purple: "text-purple-400 bg-purple-400/10",
    gray: "text-foreground/60 bg-muted"
  };

  const valueColorClasses = {
    blue: "text-primary",
    green: "text-green-400",
    orange: "text-orange-400", 
    red: "text-destructive",
    purple: "text-purple-400",
    gray: "text-foreground"
  };

  return (
    <div className={`glass-strong rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground/60">{title}</p>
          <p className={`text-2xl font-bold ${valueColorClasses[color]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-foreground/50 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
