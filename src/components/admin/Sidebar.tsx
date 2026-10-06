"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config"; // Verified internal firebase client path
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  LayoutDashboard, Users, Store, Stethoscope, 
  Pill, ShieldAlert, Settings, LogOut 
} from "lucide-react";

const navigationItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "Pharmacies", href: "/admin/pharmacies", icon: Store, hasBadge: true },
  { name: "AI Consultation Logs", href: "/admin/consultations", icon: Stethoscope },
  { name: "Medicine Database", href: "/admin/medicines", icon: Pill },
  { name: "Audit & Security Logs", href: "/admin/audit", icon: ShieldAlert },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Live Firestore connection querying real pending pharmacies
    const q = query(collection(db, "pharmacies"), where("verificationStatus", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size);
    }, (error) => {
      console.error("Firestore sidebar query error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear the middleware safety lock cookie
      document.cookie = "navok-role=; path=/; max-age=0";
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <>
      {/* Spacer to prevent layout shift since the actual sidebar will be absolute/fixed over content */}
      <div className="w-16 hidden md:block shrink-0 h-screen" />
      
      <aside 
        className={`fixed top-0 left-0 z-50 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col justify-between hidden md:flex ${
          isExpanded 
            ? "w-[280px] bg-[#09090B]/95 backdrop-blur-2xl border-r border-zinc-800/80 shadow-2xl p-6" 
            : "w-16 bg-transparent p-4 border-r border-transparent"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="w-full">
          {/* Workspace Brand Lockup */}
          <div className={`flex items-center gap-3 transition-all duration-300 ${isExpanded ? 'mb-8 px-2' : 'mb-8 justify-center'}`} onMouseEnter={() => setIsExpanded(true)}>
            <Link href="/admin" className="shrink-0 flex items-center justify-center">
              <Image 
                src="/NavOk Heal Logo.png" 
                alt="NavOk Heal" 
                width={32} 
                height={32} 
                className="rounded-lg object-contain bg-zinc-900 shadow-lg border border-zinc-800 hover:scale-105 transition-transform"
              />
            </Link>
            
            <Link href="/admin" className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              <span className="font-semibold tracking-wide text-md text-white whitespace-nowrap hover:text-indigo-400 transition-colors">NavOk Heal</span>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">HQ</span>
            </Link>
          </div>

          {/* Navigation Matrix */}
          <nav className={`space-y-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-h-[800px]' : 'opacity-0 max-h-0'}`}>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group hover:bg-zinc-800/30">
                  <div className="flex items-center gap-3 z-10">
                    <item.icon className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"}`} />
                    <span className={`text-sm tracking-wide transition-colors duration-300 ${isActive ? "text-white font-medium" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                      {item.name}
                    </span>
                  </div>

                  {item.hasBadge && pendingCount > 0 && (
                    <span className="z-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold animate-pulse">
                      {pendingCount}
                    </span>
                  )}

                  {/* Framer Motion Active Indicator Ribbon */}
                  {isActive && (
                    <motion.div layoutId="activeNavBackground" className="absolute inset-0 bg-gradient-to-r from-zinc-800/80 to-zinc-900/40 rounded-xl border-l-2 border-indigo-500 z-0 shadow-inner" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Corporate Admin ID Card Footer */}
        <div className={`border-t border-zinc-800/80 pt-4 flex items-center justify-between px-2 group overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-h-[200px]' : 'opacity-0 max-h-0'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-purple-400 uppercase">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-zinc-200 truncate">System Operator</span>
              <span className="text-[10px] text-zinc-500 font-mono truncate">admin04@gmail.com</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
