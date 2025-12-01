import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function Logo({ className = "", showText = true, size = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB7185" /> {/* Soft Coral/Rose */}
            <stop offset="100%" stopColor="#F43F5E" /> {/* Slightly deeper Rose */}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Main Shape: Stylized Heart/Baby Face fusion */}
        <path
          d="M16 4C12.5 4 10 6.5 10 9.5C10 13 13 16 16 20C19 16 22 13 22 9.5C22 6.5 19.5 4 16 4Z"
          fill="url(#logo-gradient)"
          className="drop-shadow-sm"
        />
        
        {/* AI/Tech Element: Orbiting Node */}
        <circle cx="16" cy="24" r="2" fill="#10B981" className="animate-pulse"> {/* Sage/Emerald Green */}
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Connecting Line (Smile/Network) */}
        <path
          d="M10 20C10 20 12 24 16 24C20 24 22 20 22 20"
          stroke="#FCD34D" /* Soft Honey */
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Sparkles */}
        <path
          d="M26 6L27 8L29 9L27 10L26 12L25 10L23 9L25 8L26 6Z"
          fill="#FCD34D"
          className="animate-[spin_3s_linear_infinite]"
          style={{ transformOrigin: "26px 9px" }}
        />
      </svg>
      
      {showText && (
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
          BabyCare<span className="text-rose-500">.ai</span>
        </span>
      )}
    </div>
  );
}
