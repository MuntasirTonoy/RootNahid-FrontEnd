"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/loading.json";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuthGuard({
  children,
  forbiddenRoles = [],
  allowedRoles = [],
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="w-64 h-64">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAllowedByRole =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);
  const isForbiddenByRole = forbiddenRoles.includes(user.role);
  const accessDenied = !isAllowedByRole || isForbiddenByRole;

  if (accessDenied) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6 animate-in zoom-in duration-300">
          <AlertCircle className="text-red-500" size={64} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You don't have permission to access the requested page. Please contact
          your administrator if you believe this is a mistake.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
