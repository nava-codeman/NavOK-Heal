import React from 'react';

interface LampIllustrationProps {
  className?: string;
  isOn?: boolean;
}

export function LampIllustration({ className = '', isOn = true }: LampIllustrationProps) {
  return (
    <svg 
      width="64" 
      height="48" 
      viewBox="0 0 64 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lamp Cap / Socket */}
      <path 
        d="M28 0H36V8H28V0Z" 
        fill="#3F3F46" 
      />
      <path 
        d="M26 8H38V12H26V8Z" 
        fill="#27272A" 
      />
      
      {/* Lamp Shade (Industrial / Retro Cone shape) */}
      <path 
        d="M24 12L4 36C4 36 2 40 6 40H58C62 40 60 36 60 36L40 12H24Z" 
        fill="#18181B" 
        stroke="#3F3F46" 
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Inner Rim */}
      <path 
        d="M6 40C6 40 20 44 32 44C44 44 58 40 58 40" 
        stroke="#52525B" 
        strokeWidth="2"
      />

      {/* Glowing/Off Bulb */}
      <circle 
        cx="32" 
        cy="40" 
        r="6" 
        fill={isOn ? "#FDE68A" : "#3F3F46"} 
        filter={isOn ? "drop-shadow(0px 0px 8px #FBBF24)" : "none"}
        className="transition-all duration-300"
      />
    </svg>
  );
}
