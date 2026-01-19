"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const { signup, updateUserProfile, googleSignIn, verifyEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      await signup(email, password);
      await updateUserProfile({ displayName: name });
      await verifyEmail();
      toast.success('Account created! Please check your email to verify.');
      router.push('/profile');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      toast.success('Account created with Google!');
      router.push('/profile');
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
                Join <span className="text-primary">RootNahid</span>
            </h1>
            <p className="text-muted-foreground text-lg">
                Create an account to start mastering mathematics
            </p>
        </div>

        {/* Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border shadow-xl rounded-3xl p-8 space-y-8">
            
             {/* Google Sign In */}
             <button 
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl shadow-sm bg-surface hover:bg-muted/50 transition-all duration-200 group"
            >
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12.0003 20.45c4.6667 0 8.6167-3.15 9.95-7.4667H12.0003V9.55005h13.3333c0.1334 0.96665 0.2 1.98335 0.2 3.01665 0 7.7333-5.5 13.4333-13.5333 13.4333-7.7333 0-14-6.2667-14-14s6.2667-14 14-14c3.7833 0 7.2167 1.4 9.8833 3.9l-3.8 3.8c-1.55-1.5-3.6666-2.3833-6.0833-2.3833-4.9666 0-9.0166 4.05-9.0166 9.0166s4.05 9.0167 9.0166 9.0167z" fill="currentColor" className="text-foreground" />
                <path d="M25.3336 12.5667c0-1.0333-.0667-2.05-.2-3.01665H12.0003v3.4333h7.4833c-.35 1.7-1.3333 3.15-2.8167 4.15l4.5 3.5c2.6334-2.4333 4.1667-6.0167 4.1667-8.06665z" fill="#4285F4" />
                <path d="M12.0003 26c3.6 0 6.6334-1.1833 8.9-3.2666l-4.5-3.5c-1.2.8166-2.7334 1.3-4.4 1.3-3.3834 0-6.25-2.2834-7.2667-5.3667l-4.4166 3.4167C2.9669 22.85 7.15026 26 12.0003 26z" fill="#34A853" />
                <path d="M4.7336 15.1667C4.2169 13.6167 4.2169 11.95 4.7336 10.4L.31693 6.98335C-1.48307 10.5667-1.48307 14.8333.31693 18.4167l4.41667-3.25z" fill="#FBBC05" />
                <path d="M12.0003 7.0333c1.9667 0 3.7333.7 5.1167 1.8667l3.8-3.8c-2.6666-2.5-6.1-3.9-9.8833-3.9-4.85 0-9.0333 3.15-11.6833 7.38335L3.7336 11.8c1.0167-3.0833 3.8834-5.3667 7.2667-5.3667z" fill="#EA4335" />
                </svg>
                <span className="font-semibold text-foreground">Sign up with Google</span>
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground backdrop-blur-xl">Or register with email</span>
                </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
                 {/* Name Input */}
                 <div className="group space-y-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <User size={20} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="John Doe" 
                            className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none" 
                            required 
                        />
                    </div>
                </div>

                {/* Email Input */}
                <div className="group space-y-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Mail size={20} />
                        </div>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none" 
                            required 
                        />
                    </div>
                </div>
            
                {/* Password Input */}
                <div className="group space-y-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Lock size={20} />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Create a password" 
                            className="block w-full pl-10 pr-10 py-3 border border-border rounded-xl bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none" 
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

                <button 
                type="submit" 
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/25 text-base font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={loading}
                >
                {loading ? (
                    <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Creating Account...
                    </>
                ) : (
                    <>
                    Create Account 
                    <ArrowRight size={18} className="ml-2" />
                    </>
                )}
                </button>
            </form>
        </div>

        {/* Footer */}
        <div className="text-center">
             <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                    Login instead
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}
