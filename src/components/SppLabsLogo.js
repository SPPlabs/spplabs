import React from "react";

/**
 * Custom SPP Labs Logo component.
 * Renders the brand mark using inline SVG paths designed to match the reference typography and color scheme.
 * 
 * Props:
 * - inline (boolean): If true, renders "SPP" and "LABS" horizontally on a single line. If false, renders them stacked.
 * - className (string): Additional Tailwind classes for sizing and custom styling.
 * - style (object): Custom inline styling.
 */
export function SppLabsLogo({ inline = false, className = "", style = {} }) {
  if (inline) {
    return (
      <svg
        viewBox="0 0 180 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block select-none ${className}`}
        style={{ height: "1.25em", width: "auto", ...style }}
        aria-label="SPP Labs"
      >
        {/* SPP (Thinner and wider custom rounded paths) */}
        <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          {/* S */}
          <path d="M 38 4 L 18 4 A 6 6 0 0 0 12 10 A 6 6 0 0 0 18 16 L 28 16 A 6 6 0 0 1 34 22 A 6 6 0 0 1 28 28 L 8 28" />
          {/* P1 */}
          <path d="M 46 28 L 46 4 L 62 4 A 6 6 0 0 1 68 10 A 6 6 0 0 1 62 16 L 46 16" />
          {/* P2 */}
          <path d="M 76 28 L 76 4 L 92 4 A 6 6 0 0 1 98 10 A 6 6 0 0 1 92 16 L 76 16" />
        </g>

        {/* LABS (Individual letter colors and clean monospace-styled paths) */}
        <g strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* L - Blue */}
          <path d="M 112 8 L 112 24 L 120 24" stroke="#0055ff" />
          {/* A - Cyan */}
          <path d="M 128 24 L 133 8 L 138 24 M 130 19 L 136 19" stroke="#00e5ff" />
          {/* B - Green */}
          <path d="M 146 24 L 146 8 L 152 8 A 4 4 0 0 1 156 12 A 4 4 0 0 1 152 16 L 146 16 M 146 16 L 153 16 A 4 4 0 0 1 157 20 A 4 4 0 0 1 153 24 L 146 24" stroke="#10b981" />
          {/* S - Orange */}
          <path d="M 172 10 L 167 10 A 3 3 0 0 0 164 13 A 3 3 0 0 0 167 16 L 169 16 A 3 3 0 0 1 172 19 A 3 3 0 0 1 169 22 L 164 22" stroke="#f97316" />
        </g>
      </svg>
    );
  }

  // Stacked layout (matching the reference image structure)
  return (
    <svg
      viewBox="0 0 114 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block select-none ${className}`}
      style={{ height: "2.5em", width: "auto", ...style }}
      aria-label="SPP Labs"
    >
      {/* SPP (Thinner and wider custom rounded paths) */}
      <g stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        {/* S */}
        <path d="M 38 4 L 18 4 A 7 7 0 0 0 11 11 A 7 7 0 0 0 18 18 L 28 18 A 7 7 0 0 1 35 25 A 7 7 0 0 1 28 32 L 8 32" />
        {/* P1 */}
        <path d="M 46 32 L 46 4 L 62 4 A 7 7 0 0 1 69 11 A 7 7 0 0 1 62 18 L 46 18" />
        {/* P2 */}
        <path d="M 78 32 L 78 4 L 94 4 A 7 7 0 0 1 101 11 A 7 7 0 0 1 94 18 L 78 18" />
      </g>

      {/* LABS (Individual letter colors and clean monospace-styled paths) */}
      <g strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* L - Blue */}
        <path d="M 12 40 L 12 50 L 18 50" stroke="#0055ff" />
        {/* A - Cyan */}
        <path d="M 38 50 L 42 40 L 46 50 M 39 47 L 45 47" stroke="#00e5ff" />
        {/* B - Green */}
        <path d="M 66 50 L 66 40 L 71 40 A 2.5 2.5 0 0 1 73.5 42.5 A 2.5 2.5 0 0 1 71 45 L 66 45 M 66 45 L 71.5 45 A 2.5 2.5 0 0 1 74 47.5 A 2.5 2.5 0 0 1 71.5 50 L 66 50" stroke="#10b981" />
        {/* S - Orange */}
        <path d="M 99 42 L 95 42 A 2.5 2.5 0 0 0 92.5 44.5 A 2.5 2.5 0 0 0 95 47 L 96.5 47 A 2.5 2.5 0 0 1 99 49.5 A 2.5 2.5 0 0 1 96.5 52 L 92.5 52" stroke="#f97316" />
      </g>
    </svg>
  );
}
