import { ReactNode } from "react";
import Topbar from "./Topbar";
import LoadingSpinner from "./LoadingSpinner";
import { AnimatedBackground } from "./AnimatedBackground";

interface PageLayoutProps {
  children: ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  className?: string;
}

export default function PageLayout({ 
  children, 
  loading = false, 
  loadingMessage = "Loading...",
  className = ""
}: PageLayoutProps) {
  if (loading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  return (
    <div className={`min-h-screen bg-background relative overflow-clip ${className}`}>
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Topbar />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          {children}
        </div>
      </div>
    </div>
  );
}
