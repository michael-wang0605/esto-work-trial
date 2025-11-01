"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";
import { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth");
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return <LoadingSpinner message="Loading..." />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session?.user) {
    return fallback || null;
  }

  return <>{children}</>;
}
