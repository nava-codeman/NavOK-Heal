"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { SocialLoginPlaceholders } from "@/components/auth/SocialLoginPlaceholders";
import { LampIllustration } from "@/components/LampIllustration";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      let userRole = "patient"; // default

      // Check Firestore for the user's role
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        userRole = userDoc.data().role || "patient";
      }

      // Apply admin auto-provisioning check
      const adminEmails = ["admin@example.com", "admin04@gmail.com"];
      if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        userRole = "admin";
      }

      toast.success("Successfully logged in!");
      
      // Write the role to a cookie for the middleware safety lock
      document.cookie = `navok-role=${userRole}; path=/; max-age=86400`; // 1 day expiration

      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push(`/dashboard/${userRole}`);
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.message?.includes('auth/invalid-credential')) {
        toast.error("Invalid email or password. Please try again or create an account.");
      } else {
        toast.error(error.message || "Failed to log in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 mesh-gradient opacity-40 z-0"></div>

      {/* 
        Animated Lamp & Light Sweep Layer 
        - Positioned behind the glass card (z-[5] vs z-10)
        - Swings using continuous keyframes
        - Hides on very small screens to prevent clutter
      */}
      <div className="absolute top-0 left-[15%] md:left-[25%] bottom-0 w-64 pointer-events-none z-[5] hidden sm:block origin-top animate-swing">
        {/* The thin cord hanging from the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-32 md:h-48 bg-zinc-800/80"></div>
        
        {/* The SVG Lamp placed exactly at the end of the cord */}
        <div className="absolute top-[128px] md:top-[192px] left-1/2 -translate-x-1/2 z-10">
          <LampIllustration isOn={lampOn} />
          
          {/* Interactive Pull Cord Switch (pointer-events-auto allows dragging it despite parent being none) */}
          <motion.div 
            className="absolute left-[31px] top-[40px] flex flex-col items-center cursor-grab active:cursor-grabbing pointer-events-auto"
            drag="y"
            dragConstraints={{ top: 0, bottom: 40 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
               if (info.offset.y > 20) {
                 setLampOn(prev => !prev);
               }
            }}
          >
            {/* The string */}
            <div className="w-[1.5px] h-12 bg-zinc-700 shadow-inner"></div>
            {/* The bobble at the end */}
            <div className={`w-2.5 h-2.5 rounded-full border border-zinc-500 transition-colors duration-300 ${lampOn ? 'bg-amber-500 shadow-[0_0_8px_#FBBF24]' : 'bg-zinc-700'}`}></div>
          </motion.div>
        </div>

        {/* The Warm Light Cone Sweep 
            - Adjust opacity here to tweak glow intensity 
            - Travels identically with the lamp because it shares the same swinging container 
        */}
        <div 
          className={`absolute top-[170px] md:top-[234px] left-1/2 -translate-x-1/2 w-[600px] h-[800px] mix-blend-screen transition-opacity duration-300 ${lampOn ? 'opacity-[0.18]' : 'opacity-0'}`}
          style={{
            background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 1) 0%, rgba(253, 230, 138, 0.4) 40%, transparent 70%)',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(40px)'
          }}
        ></div>
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your NavOk Heal account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold rounded-xl px-4 py-3 mt-4 hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <SocialLoginPlaceholders />

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
