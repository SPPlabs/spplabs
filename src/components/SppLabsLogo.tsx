import React from "react";

interface SppLabsLogoProps {
  inline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Custom SPP Labs Logo component.
 * Renders the brand mark using transparent WebP images with dynamic color masking.
 * 
 * Props:
 * - inline (boolean): If true, renders "SPP" and "LABS" horizontally. If false, renders them stacked.
 * - className (string): Additional Tailwind classes for styling.
 * - style (object): Custom inline styling.
 */
export function SppLabsLogo({
  inline = false,
  className = "",
  style = {},
}: SppLabsLogoProps) {
  const defaultHeight = inline ? "3.2em" : "6.4em";
  const { height, width, ...restStyle } = style;

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        height: height || defaultHeight,
        width: width || "auto",
        lineHeight: 0,
        ...restStyle,
      }}
    >
      {inline ? (
        // Horizontal Layout: SPP and Labs side-by-side
        <div
          className="flex items-center"
          style={{
            height: "100%",
            gap: "0.05em",
          }}
        >
          {/* SPP letters using CSS mask to support currentColor dynamic coloring */}
          <span
            style={{
              display: "inline-block",
              height: "100%",
              aspectRatio: "1.5",
              backgroundColor: "currentColor",
              WebkitMaskImage: "url(/spp.webp)",
              maskImage: "url(/spp.webp)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
          {/* Labs letters standard gradient WebP */}
          <img
            src="/labs.webp"
            alt="Labs"
            style={{
              height: "100%",
              aspectRatio: "1.5",
              objectFit: "contain",
            }}
            draggable={false}
          />
        </div>
      ) : (
        // Stacked Layout: SPP on top, Labs on bottom
        <div
          className="flex flex-col items-center justify-between"
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          {/* SPP letters using CSS mask */}
          <span
            style={{
              display: "inline-block",
              height: "60%",
              aspectRatio: "1.5",
              backgroundColor: "currentColor",
              WebkitMaskImage: "url(/spp.webp)",
              maskImage: "url(/spp.webp)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
          {/* Labs letters standard gradient WebP */}
          <img
            src="/labs.webp"
            alt="Labs"
            style={{
              height: "35%",
              aspectRatio: "1.5",
              objectFit: "contain",
            }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}

// Export as both casings to satisfy user component naming and folder resolution
export const SPPLabsLogo = SppLabsLogo;
export default SppLabsLogo;
