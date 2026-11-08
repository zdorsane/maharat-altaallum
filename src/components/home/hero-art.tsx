import { Check, Star } from "lucide-react";
import type { Dict } from "@/lib/i18n/server";

const TILES = [
  { ch: "أ", x: 96, y: 214, r: -8, fill: "var(--sun)", delay: "0s" },
  { ch: "b", x: 184, y: 150, r: 6, fill: "var(--teal)", delay: "-1.5s" },
  { ch: "ب", x: 280, y: 132, r: -4, fill: "var(--blush)", delay: "-3s" },
  { ch: "a", x: 368, y: 196, r: 9, fill: "#F7F5EF", delay: "-4.5s" },
];

/** Original hero illustration: letters lifting out of an open book, with floating learning cards. */
export function HeroArt({ t }: { t: Dict["home"]["preview"] }) {
  return (
    <figure className="animate-fade-up relative mx-auto aspect-[52/48] w-full max-w-[34rem] [animation-delay:200ms]" aria-label={t.label}>
      <svg viewBox="0 0 520 480" className="absolute inset-0 size-full" aria-hidden>
        {/* backdrop shapes */}
        <circle cx="270" cy="250" r="198" fill="var(--primary-soft)" />
        <circle cx="436" cy="92" r="40" fill="var(--sun)" opacity=".9" />
        <path d="M30 250a110 110 0 0 1 110-110" fill="none" stroke="var(--blush)" strokeWidth="18" strokeLinecap="round" />
        <circle cx="70" cy="120" r="7" fill="var(--teal)" />
        <circle cx="470" cy="300" r="5" fill="var(--primary)" opacity=".5" />

        {/* journey path from the book up through the letters */}
        <path
          d="M262 330C200 300 120 290 128 246S220 196 216 182 300 150 312 164 400 210 400 228"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity=".35"
          strokeWidth="2.5"
          strokeDasharray="2 9"
          strokeLinecap="round"
        />

        {/* floating letter tiles */}
        {TILES.map((tile) => (
          <g key={tile.ch} className="animate-float [transform-box:fill-box]" style={{ animationDelay: tile.delay }}>
            <g transform={`rotate(${tile.r} ${tile.x + 32} ${tile.y + 32})`}>
              <rect x={tile.x} y={tile.y + 6} width="64" height="64" rx="16" fill="var(--ink)" opacity=".08" />
              <rect x={tile.x} y={tile.y} width="64" height="64" rx="16" fill={tile.fill} stroke="var(--line)" strokeWidth={tile.fill === "#F7F5EF" ? 2 : 0} />
              <text x={tile.x + 32} y={tile.y + 34} textAnchor="middle" dominantBaseline="central" fontSize="32" fontWeight="800" fill="#283C48">
                {tile.ch}
              </text>
            </g>
          </g>
        ))}

        {/* open book */}
        <ellipse cx="262" cy="440" rx="190" ry="14" fill="var(--ink)" opacity=".08" />
        <path d="M72 336c64-28 128-26 190 8v96c-62-32-126-34-190-8Z" fill="var(--surface)" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M452 336c-64-28-128-26-190 8v96c62-32 126-34 190-8Z" fill="var(--surface)" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round" />
        <path
          d="M104 362c40-12 76-10 120 6M104 386c40-12 76-10 120 6M300 368c44-16 80-18 120-6M300 392c44-16 80-18 120-6"
          stroke="var(--primary)"
          strokeOpacity=".25"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M262 344v96" stroke="var(--primary)" strokeWidth="4" />

      </svg>

      {/* exercise card */}
      <div className="glass animate-float absolute start-0 top-[3%] w-[min(14rem,46%)] rounded-2xl border p-3.5 shadow-[var(--shadow-float)] [animation-delay:-2s]" aria-hidden>
        <p className="text-sm font-bold">{t.exercise}</p>
        <p className="text-xs text-muted">{t.exerciseHint}</p>
        <div className="mt-3 grid grid-cols-3 gap-2" dir="rtl">
          {["ت", "ب", "ث"].map((l) => (
            <span
              key={l}
              className={
                l === "ب"
                  ? "animate-pop relative grid aspect-square place-items-center rounded-xl border-2 border-mint bg-mint-soft text-2xl font-extrabold text-mint"
                  : "grid aspect-square place-items-center rounded-xl border border-line bg-surface text-2xl font-extrabold text-ink/70"
              }
            >
              {l}
              {l === "ب" && (
                <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-mint text-white dark:text-[#0e1a20]">
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* encouragement chip */}
      <div className="animate-pop absolute end-[2%] top-[34%] flex items-center gap-1.5 rounded-full bg-sun px-3.5 py-2 text-sm font-extrabold text-[#283C48] shadow-[var(--shadow-float)] [animation-delay:1.4s]" aria-hidden>
        <Star className="size-4 fill-current" />
        {t.cheer}
      </div>

      {/* progress ring card */}
      <div className="glass animate-float absolute end-0 bottom-[2%] flex items-center gap-3 rounded-2xl border p-3 pe-4 shadow-[var(--shadow-float)] [animation-delay:-4s]" aria-hidden>
        <svg viewBox="0 0 40 40" className="size-12 -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" strokeWidth="5" />
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--teal)" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset="25" className="animate-ring" />
        </svg>
        <div>
          <p className="text-xs text-muted">{t.progress}</p>
          <p dir="ltr" className="text-lg font-extrabold text-primary">{t.progressValue}</p>
        </div>
      </div>
    </figure>
  );
}
