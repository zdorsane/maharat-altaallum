// AFAQ illustration kit: small decorative SVGs shared across sections (all aria-hidden).
import { cn } from "@/lib/utils";

/** Soft, rounded five-point golden star with a light highlight. */
export function GoldStar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("drop-shadow-[0_6px_10px_rgb(246_185_77/0.45)]", className)} style={style}>
      <path
        d="M24 4.5c1.3 0 2.4.8 2.9 1.9l4.4 9.2 10 1.3c2.7.4 3.7 3.6 1.8 5.5l-7.3 7 1.8 10c.5 2.6-2.3 4.6-4.6 3.3L24 37.9l-9 4.8c-2.3 1.3-5.1-.7-4.6-3.3l1.8-10-7.3-7c-1.9-1.9-.9-5.1 1.8-5.5l10-1.3 4.4-9.2c.5-1.1 1.6-1.9 2.9-1.9Z"
        fill="#F6B94D"
      />
      <path d="M17 16.5c2.5-.6 4.2-2.5 5.3-5" stroke="#FFE3A8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Four-point sparkle. */
export function Sparkle({ className, color = "#A78BFA", style }: { className?: string; color?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} style={style}>
      <path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6Z" fill={color} />
    </svg>
  );
}

/** Fluffy cloud. */
export function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 56" aria-hidden className={className} style={style}>
      <path d="M22 52h76c11 0 20-8 20-18s-9-18-20-18c-1 0-2 0-3 .2C91 7 82 2 71 2 58 2 47 10 44 21c-2-.6-4-1-6-1-9 0-16 6-17 14-10 1-17 7-17 13 0 3 8 5 18 5Z" fill="currentColor" />
    </svg>
  );
}

/** Golden "horizon" sweep, the brand's signature curve. */
export function HorizonArc({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 80" aria-hidden className={className} style={style}>
      <path d="M4 76C40 26 112 4 196 14 118 12 52 36 14 78Z" fill="#F6B94D" />
    </svg>
  );
}

/** Purple pencil, tilted. */
export function Pencil({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 120" aria-hidden className={className} style={style}>
      <rect x="10" y="4" width="20" height="14" rx="5" fill="#F2A69B" />
      <rect x="10" y="16" width="20" height="6" fill="#D9CCFF" />
      <rect x="10" y="22" width="20" height="70" fill="#7C5CE6" />
      <rect x="10" y="22" width="7" height="70" fill="#A78BFA" />
      <path d="M10 92h20l-10 24Z" fill="#F4D9A8" />
      <path d="M16.5 108h7L20 116Z" fill="#29204D" />
    </svg>
  );
}
