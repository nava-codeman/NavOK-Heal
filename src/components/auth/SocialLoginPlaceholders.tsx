"use client";

import React from "react";
import { toast } from "sonner";
import { Phone, LogIn } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.56 14.5c-.8.15-1.66-.4-2.67-.4-.95 0-1.8.5-2.65.5-1.42 0-3.08-1.58-4.22-3.8-1.1-2.2-.9-4.8.46-6.4 1.14-1.34 2.83-2.03 4.2-2.03.88 0 1.63.29 2.29.58.48.22.95.45 1.45.45.54 0 1.05-.24 1.57-.48.66-.31 1.43-.6 2.37-.6 1.45 0 2.89.65 3.9 1.77-3.16 1.9-2.58 6.45.58 7.73-1.02 2.08-2.68 3.52-3.28 3.68zM14.64 6.12c-.75.92-2.12 1.4-3.16 1.34-.14-1.25.4-2.53 1.12-3.46.75-.98 2.07-1.52 3.12-1.48.16 1.32-.36 2.62-1.08 3.6z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
  </svg>
);

export const SocialLoginPlaceholders = () => {
  const handleComingSoon = (method: string) => {
    toast.info("Coming Soon", {
      description: `This authentication method (${method}) will be available in a future update.`,
      duration: 4000,
    });
  };

  const providers = [
    { name: "Google", icon: <GoogleIcon />, color: "bg-white text-black hover:bg-gray-100" },
    { name: "Apple", icon: <AppleIcon />, color: "bg-black text-white hover:bg-gray-800 border border-gray-700" },
    { name: "Microsoft", icon: <MicrosoftIcon />, color: "bg-[#2F2F2F] text-white hover:bg-[#3F3F3F]" },
    { name: "Facebook", icon: <LogIn className="w-5 h-5 mr-2" />, color: "bg-[#1877F2] text-white hover:bg-[#166FE5]" },
    { name: "GitHub", icon: <LogIn className="w-5 h-5 mr-2" />, color: "bg-[#333] text-white hover:bg-[#24292e]" },
    { name: "LinkedIn", icon: <LogIn className="w-5 h-5 mr-2" />, color: "bg-[#0A66C2] text-white hover:bg-[#004182]" },
    { name: "X (Twitter)", icon: <LogIn className="w-5 h-5 mr-2" />, color: "bg-black text-white hover:bg-gray-800 border border-gray-700" },
    { name: "Phone Number", icon: <Phone className="w-5 h-5 mr-2" />, color: "bg-green-600 text-white hover:bg-green-700" },
  ];

  return (
    <div className="mt-6 w-full">
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => handleComingSoon(provider.name)}
            type="button"
            className={`flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${provider.color}`}
          >
            {provider.icon}
            {provider.name}
          </button>
        ))}
      </div>
    </div>
  );
};
