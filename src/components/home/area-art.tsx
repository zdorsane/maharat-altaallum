// Small spot illustrations for the four learning areas. Each reacts to hover on the parent `.group` card.

const box = "h-28 w-full";
const fb = "[transform-box:fill-box]";

export function ReadingArt() {
  return (
    <svg viewBox="0 0 160 110" className={box} aria-hidden>
      <circle cx="128" cy="26" r="12" fill="var(--sun)" />
      <path d="M22 40c20-9 40-8 58 4v52c-18-12-38-13-58-4Z" fill="var(--surface)" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M138 40c-20-9-40-8-58 4v52c18-12 38-13 58-4Z" fill="var(--surface)" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />
      {[52, 62, 72].map((y, i) => (
        <g key={y}>
          <path d={`M32 ${y}c12-4 24-4 38 2`} stroke="var(--primary)" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path
            d={`M90 ${y + 2}c12-6 24-6 38-2`}
            stroke="var(--teal)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            className={`origin-left scale-x-50 transition-transform duration-500 group-hover:scale-x-100 ${fb}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          />
        </g>
      ))}
      <path d="M112 36v20l5-4 5 4V38" fill="var(--blush)" />
    </svg>
  );
}

export function WritingArt() {
  return (
    <svg viewBox="0 0 160 110" className={box} aria-hidden>
      <rect x="24" y="16" width="100" height="80" rx="10" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      {[44, 64, 84].map((y) => (
        <path key={y} d={`M34 ${y}h80`} stroke="var(--teal)" strokeOpacity=".5" strokeWidth="1.5" />
      ))}
      <path
        d="M38 62c6-18 14-18 14-4s-4 16 6 4 10-18 14-6-2 14 8 6 10-14 18-6"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="100"
        strokeDasharray="100"
        className="[stroke-dashoffset:38] transition-[stroke-dashoffset] duration-700 group-hover:[stroke-dashoffset:0]"
      />
      <g className={`-translate-x-10 transition-transform duration-700 group-hover:translate-x-0 ${fb}`}>
        <g transform="rotate(-50 128 54)">
          <rect x="104" y="48" width="44" height="12" rx="3" fill="var(--sun)" />
          <rect x="146" y="48" width="8" height="12" rx="2" fill="var(--blush)" />
          <path d="M104 48l-11 6 11 6Z" fill="#F4D9A8" />
        </g>
      </g>
    </svg>
  );
}

export function SpellingArt() {
  // د ا ر ("house"), laid out right-to-left.
  const tiles = [
    { ch: "د", x: 104, lift: "" },
    { ch: "ا", x: 62, lift: "-translate-y-4 rotate-6 group-hover:translate-y-0 group-hover:rotate-0" },
    { ch: "ر", x: 20, lift: "" },
  ];
  return (
    <svg viewBox="0 0 160 110" className={box} aria-hidden>
      <path d="M16 92h128" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />
      {tiles.map((t) => (
        <g key={t.ch} className={`transition-transform duration-500 ${fb} ${t.lift}`}>
          <rect x={t.x} y="44" width="38" height="42" rx="10" fill={t.ch === "ا" ? "var(--sun)" : "var(--surface)"} stroke="var(--primary)" strokeWidth="2.5" />
          <text x={t.x + 19} y="66" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="800" fill={t.ch === "ا" ? "#29204D" : "var(--ink)"}>
            {t.ch}
          </text>
        </g>
      ))}
      <circle cx="140" cy="22" r="6" fill="var(--teal)" />
      <path d="M22 26l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="var(--blush)" />
    </svg>
  );
}

export function SoundsArt() {
  return (
    <svg viewBox="0 0 160 110" className={box} aria-hidden>
      <circle cx="58" cy="56" r="34" fill="var(--surface)" stroke="var(--primary)" strokeWidth="3" />
      <text x="58" y="58" textAnchor="middle" dominantBaseline="central" fontSize="34" fontWeight="800" fill="var(--primary)">
        س
      </text>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${104 + i * 14} ${36 - i * 6}c${10 + i * 2} ${12 + i * 3} ${10 + i * 2} ${28 + i * 6} 0 ${40 + i * 12}`}
          fill="none"
          stroke={i === 1 ? "var(--sun)" : "var(--teal)"}
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-60 group-hover:animate-wave"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </svg>
  );
}
