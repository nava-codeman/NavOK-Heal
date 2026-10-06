"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Video, 
  Pill, 
  MapPin, 
  Stethoscope, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollYRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);

  // Handle Desktop Mouse Move (< 60px from top) & Hover Persistence
  useEffect(() => {
    // Check if touch device
    const isTouchDevice = () => {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    };

    if (isTouchDevice()) return;

    const handleMouseMove = (e: MouseEvent) => {
      // If cursor is within 60px of the top edge
      if (e.clientY <= 60 || isHoveredRef.current || isUserMenuOpen || isMobileMenuOpen) {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
        setIsVisible(true);
      } else {
        // Outside the top 60px zone and not hovering navbar
        if (!hideTimerRef.current && !isUserMenuOpen && !isMobileMenuOpen) {
          hideTimerRef.current = setTimeout(() => {
            if (!isHoveredRef.current && !isUserMenuOpen && !isMobileMenuOpen) {
              setIsVisible(false);
            }
          }, 1200);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  // Handle Mobile / Touch Scroll Detection (Show on scroll-up, hide on scroll-down)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show near the very top
      if (currentScrollY < 40) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // Scroll direction check
      if (currentScrollY < lastScrollYRef.current) {
        // Scrolling UP -> reveal navbar
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef.current + 10 && !isMobileMenuOpen && !isUserMenuOpen) {
        // Scrolling DOWN -> hide navbar
        setIsVisible(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen, isUserMenuOpen]);

  const navLinks = [
    { name: "AI Consultation", href: "/consultation/video", icon: Video },
    { name: "Find Medicines", href: "/medicines", icon: Pill },
    { name: "Find Pharmacy", href: "/pharmacies/map", icon: MapPin },
    { name: "Find Doctor", href: "/doctors", icon: Stethoscope },
  ];

  return (
    <>
      {/* Invisible Hover Zone at top of screen for Desktop (< 60px) */}
      <div 
        className="fixed top-0 left-0 right-0 h-16 z-40 pointer-events-auto"
        onMouseEnter={() => {
          isHoveredRef.current = true;
          setIsVisible(true);
        }}
      />

      {/* Main Animated Navbar */}
      <header
        onMouseEnter={() => {
          isHoveredRef.current = true;
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          setIsVisible(true);
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
          if (!isUserMenuOpen && !isMobileMenuOpen) {
            hideTimerRef.current = setTimeout(() => {
              if (!isHoveredRef.current) setIsVisible(false);
            }, 1200);
          }
        }}
        className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl z-50 transition-all duration-400 ease-out transform ${
          isVisible 
            ? "translate-y-0 opacity-100 shadow-[0_12px_36px_-8px_rgba(20,51,47,0.12)]" 
            : "-translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-md border border-[#E8E2D5] rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#14332F] flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
              <Image 
                src="/NavOk Heal Logo.png" 
                alt="NavOk Heal" 
                width={28} 
                height={28} 
                className="object-contain filter brightness-0 invert" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[#14332F] font-bold tracking-tight text-base leading-none">
                NavOk <span className="text-[#2A6A5E] font-serif-accent font-normal italic">Heal</span>
              </span>
              <span className="text-[10px] text-[#5E6E69] font-medium tracking-wide">Healthcare</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#14332F] text-[#FAF7F0]"
                      : "text-[#5E6E69] hover:text-[#14332F] hover:bg-[#FAF7F0]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions: Auth & Pill CTA */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F0] border border-[#E8E2D5] text-[#14332F] text-xs font-medium hover:bg-[#EBF3EE] transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#14332F] text-[#FAF7F0] flex items-center justify-center text-[10px] font-bold">
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.displayName || user.email?.split("@")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-[#5E6E69]" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E2D5] rounded-2xl shadow-healink p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-[#E8E2D5] mb-1">
                      <p className="text-[11px] font-semibold text-[#14332F] truncate">{user.email}</p>
                      <p className="text-[10px] text-[#2A6A5E] uppercase font-bold tracking-wider mt-0.5">{role || "Patient"}</p>
                    </div>
                    <Link
                      href={role === "admin" ? "/admin/dashboard" : "/dashboard/patient"}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#14332F] hover:bg-[#FAF7F0] rounded-xl transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#2A6A5E]" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await logout();
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium text-[#14332F] hover:bg-[#FAF7F0] transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Main Pill CTA Button */}
            <Link
              href="/consultation/video"
              className="px-4 md:px-5 py-2 rounded-full bg-[#14332F] hover:bg-[#1A3D3A] text-[#FAF7F0] text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Intake
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-[#14332F] hover:bg-[#FAF7F0] rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white/95 backdrop-blur-md border border-[#E8E2D5] rounded-3xl p-4 shadow-healink animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#14332F] text-[#FAF7F0]"
                        : "text-[#5E6E69] hover:text-[#14332F] hover:bg-[#FAF7F0]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-2 text-center py-2.5 rounded-full border border-[#E8E2D5] text-[#14332F] text-xs font-semibold hover:bg-[#FAF7F0]"
                >
                  Sign In to Account
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
