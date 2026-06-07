import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function DswdRamsLogo({ className = "", size = 48 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${className}`}
      id="dswd-rams-logo-svg"
    >
      {/* Golden Shield Container with elegant rounded corners at the bottom */}
      <path
        d="M100 50 H412 V300 C412 390 320 462 256 462 C192 462 100 390 100 300 V50 Z"
        fill="white"
        stroke="#FFD700"
        strokeWidth="24"
        strokeLinejoin="round"
      />
      
      {/* Outer Golden Shield Accent Layer */}
      <path
        d="M116 66 H396 V300 C396 380 316 446 256 446 C196 446 116 380 116 300 V66 Z"
        stroke="#F5C400"
        strokeWidth="8"
        strokeLinejoin="round"
      />

      {/* Styled Blue Hands supportive frame (Y-shape/hand design) */}
      {/* Left blue supportive hand */}
      <path
        d="M140 100 V290 L200 360 V420 H250 V320 L180 240 V100 H140 Z"
        fill="#0000CD"
      />
      {/* Right blue supportive hand */}
      <path
        d="M372 100 V290 L312 360 V420 H262 V320 L332 240 V100 H372 Z"
        fill="#0000CD"
      />
      
      {/* Center Bright Red Blocky Heart symbol representing social welfare and dedication */}
      <path
        d="M180 130 H250 V200 H262 V130 H332 V210 L256 294 L180 210 V130 Z"
        fill="#FF0000"
      />
      {/* Soft rounded curves on the heart tops */}
      <path
        d="M180 130 C180 100 230 100 250 130 C270 100 320 100 320 130"
        stroke="#FF0000"
        strokeWidth="32"
        strokeLinecap="round"
      />
    </svg>
  );
}
