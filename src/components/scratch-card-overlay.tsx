import { cn } from "@/lib/utils";
import type { ScratchCoverStyle } from "@/lib/engine/chance";
import type { CoverVisual, Stroke } from "./scratch-card-cover";

export function ScratchCardOverlay({
  maskId,
  filterId,
  strokes,
  visual,
  coverStyle,
  scratching,
}: {
  maskId: string;
  filterId: string;
  strokes: Stroke[];
  visual: CoverVisual;
  coverStyle: ScratchCoverStyle;
  scratching: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      data-testid="scratch-overlay"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id={`${maskId}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={visual.gradFrom} />
          <stop offset="100%" stopColor={visual.gradTo} />
        </linearGradient>
        {/* Metallic flecks + one static diagonal sheen (not
                    animated, a real foil doesn't sweep), under the same
                    reveal mask as the base gradient — a flat cover reads
                    cheap. */}
        {visual.pattern === "foil-fleck" && (
          <>
            <pattern
              id={`${maskId}-foil`}
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(12)"
            >
              <circle
                cx="1.1"
                cy="1.1"
                r="0.45"
                fill="white"
                fillOpacity="0.16"
              />
              <circle
                cx="3.4"
                cy="3.2"
                r="0.3"
                fill="white"
                fillOpacity="0.1"
              />
            </pattern>
            <linearGradient
              id={`${maskId}-sheen`}
              x1="0%"
              y1="100%"
              x2="38%"
              y2="0%"
            >
              <stop offset="30%" stopColor="white" stopOpacity="0" />
              <stop offset="46%" stopColor="white" stopOpacity="0.16" />
              <stop offset="62%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </>
        )}
        {/* Roughens each stroke's edge into a torn/scratched
                    texture instead of a perfectly smooth round-capped
                    line — a clean line reads as "drawn," a jagged one
                    reads as "scratched." */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100"
          height="60"
        >
          <rect x="0" y="0" width="100" height="60" fill="white" />
          <g data-testid="scratch-strokes" filter={`url(#${filterId})`}>
            {strokes.map((s) => (
              <path
                key={s.id}
                data-testid="scratch-path"
                d={s.d}
                pathLength={100}
                fill="none"
                stroke="black"
                strokeWidth={s.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  scratching ? "scratch-draw-in" : "[stroke-dashoffset:100]",
                )}
                style={
                  scratching ? { animationDelay: `${s.delayMs}ms` } : undefined
                }
              />
            ))}
          </g>
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100"
        height="60"
        fill={`url(#${maskId}-grad)`}
        mask={`url(#${maskId})`}
      />
      {visual.pattern === "foil-fleck" && (
        <>
          <rect
            x="0"
            y="0"
            width="100"
            height="60"
            fill={`url(#${maskId}-foil)`}
            mask={`url(#${maskId})`}
          />
          <rect
            x="0"
            y="0"
            width="100"
            height="60"
            fill={`url(#${maskId}-sheen)`}
            mask={`url(#${maskId})`}
          />
        </>
      )}
      {visual.decoration === "wax-medallion" && (
        <g mask={`url(#${maskId})`}>
          <circle
            cx="50"
            cy="24"
            r="11"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1"
            strokeOpacity="0.55"
          />
          <circle
            cx="50"
            cy="24"
            r="7.5"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="0.6"
            strokeOpacity="0.4"
          />
          <path
            d="M50 18 L52.5 22.5 L57.5 23.2 L54 26.7 L54.8 31.5 L50 29 L45.2 31.5 L46 26.7 L42.5 23.2 L47.5 22.5 Z"
            fill="var(--color-gold)"
            fillOpacity="0.5"
          />
        </g>
      )}
      {visual.decoration === "ticket-lines" && (
        <g mask={`url(#${maskId})`}>
          <path
            d="M0 0 L14 0 L0 12 Z"
            fill="var(--color-gold)"
            fillOpacity="0.18"
          />
          <path
            d="M100 60 L86 60 L100 48 Z"
            fill="var(--color-gold)"
            fillOpacity="0.18"
          />
          <line
            x1="50"
            y1="4"
            x2="50"
            y2="56"
            stroke="var(--color-gold)"
            strokeWidth="0.8"
            strokeOpacity="0.35"
            strokeDasharray="2 2"
          />
        </g>
      )}
      <text
        x="50"
        y={visual.decoration === "wax-medallion" ? 46 : 30}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={coverStyle === "ticket" ? "rotate(-4 50 30)" : undefined}
        className="text-[7px] font-semibold"
        fill={visual.textColor}
        letterSpacing={coverStyle === "ticket" ? "0.5" : undefined}
        mask={`url(#${maskId})`}
      >
        {visual.text}
      </text>
    </svg>
  );
}
