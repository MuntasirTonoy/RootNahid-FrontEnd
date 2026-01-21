"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login, googleSignIn, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email to reset password.");
      return;
    }
    try {
      await resetPassword(email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await login(email, password);
      toast.success("Login successful! Welcome back.");
      router.push(redirectPath);
    } catch (error) {
      console.log(error);
      let message = error.message;
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        message = "Password or email wrong";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      toast.success("Logged in with Google!");
      router.push(redirectPath);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-md p-8 space-y-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="group space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-md bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all border-border outline-none"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-primary hover:text-primary/80 hover:underline focus:outline-none hover:cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 border border-border rounded-md bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all border-border outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-md border-border text-base font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:-translate-y-0.5 hover:cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <LogIn size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground backdrop-blur-xl">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-md border-border bg-surface hover:bg-muted/50 hover:cursor-pointer transition-all duration-200 group"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:scale-110"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              {/* Blue section */}
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              {/* Green section */}
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              {/* Yellow section */}
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              {/* Red section */}
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-semibold text-foreground">
              Continue with Google
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
