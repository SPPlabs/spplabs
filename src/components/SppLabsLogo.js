import React from "react";

/**
 * Custom SPP Labs Logo component.
 * Renders the brand mark using styled SVG <text> elements to use actual fonts
 * (Montserrat for SPP and Geist Mono for LABS) with the specific brand colors.
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
        viewBox="0 0 140 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block select-none ${className}`}
        style={{ height: "1.25em", width: "auto", ...style }}
        aria-label="SPP Labs"
      >
        {/* SPP - Clean Geometric Sans-Serif Font */}
        <text
          x="0"
          y="24"
          fill="currentColor"
          fontSize="24"
          fontWeight="900"
          fontFamily="var(--font-montserrat), var(--font-geist-sans), sans-serif"
          letterSpacing="-0.03em"
        >
          SPP
        </text>

        {/* LABS - Clean Monospace Font with individual letter colors */}
        <text
          x="58"
          y="24"
          fontSize="24"
          fontWeight="900"
          fontFamily="var(--font-geist-mono), monospace"
          letterSpacing="0.02em"
        >
          <tspan fill="#0055ff">L</tspan>
          <tspan fill="#00e5ff">A</tspan>
          <tspan fill="#10b981">B</tspan>
          <tspan fill="#f97316">S</tspan>
        </text>
      </svg>
    );
  }

  // Stacked layout (for dashboard sidebar and footer stacked states)
  return (
    <svg
      viewBox="0 0 90 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block select-none ${className}`}
      style={{ height: "2.5em", width: "auto", ...style }}
      aria-label="SPP Labs"
    >
      {/* SPP */}
      <text
        x="0"
        y="26"
        fill="currentColor"
        fontSize="28"
        fontWeight="900"
        fontFamily="var(--font-montserrat), var(--font-geist-sans), sans-serif"
        letterSpacing="-0.03em"
      >
        SPP
      </text>

      {/* LABS */}
      <text
        x="0"
        y="50"
        fontSize="24"
        fontWeight="900"
        fontFamily="var(--font-geist-mono), monospace"
        letterSpacing="0.04em"
      >
        <tspan fill="#0055ff">L</tspan>
        <tspan fill="#00e5ff">A</tspan>
        <tspan fill="#10b981">B</tspan>
        <tspan fill="#f97316">S</tspan>
      </text>
    </svg>
  );
}
