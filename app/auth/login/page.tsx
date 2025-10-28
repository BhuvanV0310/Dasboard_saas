"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Form validation
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Use NextAuth signIn with credentials provider
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false, // Handle redirect manually
      });

  if (result?.error) {
        // Handle specific error messages
        if (result.error === "Invalid credentials") {
          setError("Invalid email or password. Please try again.");
        } else if (result.error === "Email and password required") {
          setError("Please provide both email and password.");
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else if (result?.ok) {
        // Successful login - wait for session to include role, then redirect by role
        try {
          const timeoutMs = 3000;
          const start = Date.now();
          let role: string | undefined;

          // Poll session until role is present or timeout
          while (Date.now() - start < timeoutMs && !role) {
            // Prefer getSession from next-auth; falls back to fetch if needed
            const session = await getSession();
            role = (session as any)?.user?.role;
            if (!role) {
              await new Promise((r) => setTimeout(r, 150));
            }
          }

          const target = role === "ADMIN" ? "/admin-dashboard" : "/dashboard";
          // Use full navigation to ensure auth cookie is sent on first protected load
          if (typeof window !== "undefined") {
            window.location.assign(target);
          } else {
            router.push(target);
            router.refresh();
          }
        } catch {
          // Fallback redirect if session polling failed
          if (typeof window !== "undefined") {
            window.location.assign("/dashboard");
          } else {
            router.push("/dashboard");
            router.refresh();
          }
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <rect width="64" height="64" fill="transparent"/>
              <circle cx="32" cy="32" r="1" fill="rgb(59 130 246 / 0.1)" className="animate-pulse"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-32 h-32 rounded-full bg-gradient-to-r from-blue-200/30 to-indigo-200/30 blur-xl animate-float"></div>
        <div className="absolute top-2/3 right-1/6 w-24 h-24 rounded-full bg-gradient-to-r from-indigo-200/20 to-blue-200/20 blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-2/3 w-16 h-16 rotate-45 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 blur-lg animate-spin-slow"></div>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/20 animate-slide-up">
        <CardHeader className="text-center space-y-4 pb-8 pt-8">
          {/* Logo/Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-transform duration-300 hover:scale-105 animate-bounce-subtle">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800 animate-fade-in">
              Welcome Back
            </h1>
            <p className="text-slate-600 text-sm font-medium animate-fade-in-delayed">
              Sign in to access your account
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 group-hover:border-blue-300 group-hover:bg-blue-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="email"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 group-hover:border-blue-300 group-hover:bg-blue-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="current-password"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-medium animate-shake">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="animate-pulse">Signing in...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </span>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500 font-medium">
                Quick Test Accounts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="h-12 bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={async () => {
                setError(null);
                setForm({ email: "user@example.com", password: "user123" });
                setLoading(true);
                const result = await signIn("credentials", { email: "user@example.com", password: "user123", redirect: false });
                if (result?.ok) {
                  // Wait for session and redirect by role
                  const timeoutMs = 3000;
                  const start = Date.now();
                  let role: string | undefined;
                  while (Date.now() - start < timeoutMs && !role) {
                    const session = await getSession();
                    role = (session as any)?.user?.role;
                    if (!role) await new Promise((r) => setTimeout(r, 150));
                  }
                  const target = role === "ADMIN" ? "/admin-dashboard" : "/dashboard";
                  if (typeof window !== "undefined") {
                    window.location.assign(target);
                  } else {
                    router.push(target);
                    router.refresh();
                  }
                } else {
                  setError(result?.error || "Login failed");
                }
                setLoading(false);
              }}
            >
              <span className="text-lg">👤</span>
              <span className="text-xs">Demo User</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="h-12 bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={async () => {
                setError(null);
                setForm({ email: "admin@example.com", password: "admin123" });
                setLoading(true);
                const result = await signIn("credentials", { email: "admin@example.com", password: "admin123", redirect: false });
                if (result?.ok) {
                  // Wait for session and redirect by role
                  const timeoutMs = 3000;
                  const start = Date.now();
                  let role: string | undefined;
                  while (Date.now() - start < timeoutMs && !role) {
                    const session = await getSession();
                    role = (session as any)?.user?.role;
                    if (!role) await new Promise((r) => setTimeout(r, 150));
                  }
                  const target = role === "ADMIN" ? "/admin-dashboard" : "/dashboard";
                  if (typeof window !== "undefined") {
                    window.location.assign(target);
                  } else {
                    router.push(target);
                    router.refresh();
                  }
                } else {
                  setError(result?.error || "Login failed");
                }
                setLoading(false);
              }}
            >
              <span className="text-lg">⚡</span>
              <span className="text-xs">Demo Admin</span>
            </Button>
          </div>

          {/* Registration Link */}
          <div className="text-center pt-4">
            <Link 
              href="/auth/signup" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors duration-200"
            >
              Don&apos;t have an account? Register here
            </Link>
          </div>

          {/* Info Notice */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-slate-600 text-xs">
              Using NextAuth with Prisma & PostgreSQL
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(-10px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce-subtle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-3px); }
          60% { transform: translateY(-1px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delayed {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out 0.5s; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-delayed { animation: fade-in-delayed 1s ease-out 0.2s both; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .shadow-3xl { box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25); }
      `}</style>
    </div>
  );
}