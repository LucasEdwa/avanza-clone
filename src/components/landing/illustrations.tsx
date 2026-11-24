/** Original line illustrations for the start page (no third-party artwork). */

export function HeroArt() {
  return (
    <svg viewBox="0 0 420 340" className="h-auto w-full max-w-md" aria-hidden>
      <defs>
        <linearGradient id="hg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--brand)" stopOpacity=".18" />
          <stop offset="1" stopColor="var(--brand)" stopOpacity=".04" />
        </linearGradient>
      </defs>
      <circle cx="215" cy="175" r="150" fill="url(#hg)" />
      {/* bars */}
      {[60, 95, 80, 130, 170, 215].map((h, i) => (
        <rect key={i} x={95 + i * 40} y={285 - h} width="26" height={h} rx="6" fill="var(--brand)" opacity={0.25 + i * 0.12} />
      ))}
      {/* sprout */}
      <path d="M330 70 C330 110 330 120 330 150" stroke="#0b8a4f" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M330 110 C300 100 290 78 296 60 C318 62 332 84 330 110Z" fill="#2fc27a" />
      <path d="M330 95 C356 86 368 64 362 46 C340 50 326 70 330 95Z" fill="#0b8a4f" />
      {/* coins */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <ellipse cx="330" cy={250 - i * 14} rx="38" ry="12" fill="#f5b941" stroke="#c98a12" strokeWidth="2" />
        </g>
      ))}
      <ellipse cx="330" cy="208" rx="38" ry="12" fill="#ffd36e" stroke="#c98a12" strokeWidth="2" />
      <path d="M292 208v42M368 208v42" stroke="#c98a12" strokeWidth="2" />
      {/* badge */}
      <g transform="translate(70 70) rotate(-12)">
        <circle r="46" fill="var(--surface)" stroke="var(--brand)" strokeWidth="3" />
        <circle r="38" fill="none" stroke="var(--brand)" strokeWidth="1" strokeDasharray="3 4" />
        <text textAnchor="middle" y="-2" fontSize="22" fontWeight="800" fill="var(--brand)">0 kr</text>
        <text textAnchor="middle" y="16" fontSize="10" fontWeight="600" fill="var(--muted)">COURTAGE*</text>
      </g>
      {/* trend line */}
      <path d="M90 230 L150 205 L190 215 L240 170 L290 140" stroke="var(--fg)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="290" cy="140" r="6" fill="var(--fg)" />
    </svg>
  );
}

export function MoveArt() {
  return (
    <svg viewBox="0 0 320 220" className="h-auto w-full max-w-xs" aria-hidden>
      <circle cx="160" cy="115" r="95" fill="var(--brand-soft)" />
      {/* box */}
      <path d="M95 120 L160 95 L225 120 L160 145Z" fill="var(--surface)" stroke="var(--fg)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M95 120 V170 L160 195 V145Z" fill="var(--surface-2)" stroke="var(--fg)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M225 120 V170 L160 195 V145Z" fill="var(--surface)" stroke="var(--fg)" strokeWidth="2.5" strokeLinejoin="round" />
      {/* papers flying in */}
      {[
        [120, 40, -14],
        [175, 30, 8],
        [215, 62, 18],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <rect width="40" height="50" rx="4" fill="var(--surface)" stroke="var(--fg)" strokeWidth="2" />
          <path d="M8 14h24M8 24h24M8 34h14" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      <path d="M60 70 q20 -20 40 0" stroke="var(--brand)" strokeWidth="2.5" fill="none" strokeLinecap="round" markerEnd="" />
    </svg>
  );
}

export function StepIcon({ kind }: { kind: "account" | "deposit" | "invest" }) {
  return (
    <svg viewBox="0 0 80 64" className="h-16 w-20" aria-hidden>
      <rect x="4" y="8" width="72" height="50" rx="10" fill="var(--brand-soft)" />
      {kind === "account" ? (
        <>
          <circle cx="40" cy="26" r="9" fill="none" stroke="var(--fg)" strokeWidth="2.5" />
          <path d="M24 50c3-9 10-12 16-12s13 3 16 12" fill="none" stroke="var(--fg)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="58" cy="18" r="7" fill="#0b8a4f" />
          <path d="M55 18l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : kind === "deposit" ? (
        <>
          <rect x="18" y="22" width="44" height="26" rx="4" fill="var(--surface)" stroke="var(--fg)" strokeWidth="2.5" />
          <circle cx="40" cy="35" r="6" fill="none" stroke="var(--brand)" strokeWidth="2.5" />
          <path d="M40 4v14M34 12l6 6 6-6" stroke="var(--fg)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M16 48 L30 36 L40 42 L60 20" stroke="var(--fg)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 20h10v10" stroke="var(--fg)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="30" cy="36" r="3" fill="var(--brand)" />
          <circle cx="40" cy="42" r="3" fill="var(--brand)" />
        </>
      )}
    </svg>
  );
}

/** Small UI-mock thumbnails used on the "Aktuellt" cards. */
export function CardThumb({ variant }: { variant: "move" | "fund" | "pension" }) {
  const bg = variant === "fund" ? "bg-[#11142a]" : "bg-brand-soft";
  return (
    <div className={`relative flex h-36 items-end justify-center overflow-hidden rounded-t-2xl ${bg}`}>
      <div className="mb-[-12px] w-40 rounded-t-xl border border-border bg-surface p-3 shadow-lg">
        <div className="mb-2 h-2 w-16 rounded bg-surface-2" />
        {variant === "move" ? (
          <div className="space-y-1.5">
            {[70, 55, 80].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-brand/30" />
                <span className="h-2 rounded bg-surface-2" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        ) : variant === "fund" ? (
          <svg viewBox="0 0 120 50" className="w-full">
            <path d="M0 40 L20 34 L40 37 L60 22 L80 26 L100 12 L120 8" stroke="var(--pos)" strokeWidth="2.5" fill="none" />
            <path d="M0 40 L20 34 L40 37 L60 22 L80 26 L100 12 L120 8 V50 H0Z" fill="var(--pos)" opacity=".12" />
          </svg>
        ) : (
          <div className="flex items-end gap-1.5">
            {[30, 42, 38, 55, 64].map((h, i) => (
              <span key={i} className="w-4 rounded-sm bg-brand" style={{ height: h, opacity: 0.3 + i * 0.15 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PhoneMock() {
  return (
    <div className="relative mx-auto w-56 rotate-[-6deg] rounded-[2.2rem] border-[7px] border-[#11142a] bg-surface p-3 shadow-2xl">
      <div className="mx-auto mb-3 h-4 w-20 rounded-full bg-[#11142a]" />
      <div className="text-[10px] text-muted">Totalt värde</div>
      <div className="text-xl font-bold">412 870 kr</div>
      <div className="text-[11px] font-semibold text-pos">+2 315 kr (+0,56 %) idag</div>
      <svg viewBox="0 0 160 60" className="mt-2 w-full">
        <path d="M0 50 L15 46 L30 48 L45 38 L60 40 L75 30 L90 33 L105 22 L120 25 L140 12 L160 8" stroke="var(--pos)" strokeWidth="2.5" fill="none" />
        <path d="M0 50 L15 46 L30 48 L45 38 L60 40 L75 30 L90 33 L105 22 L120 25 L140 12 L160 8 V60 H0Z" fill="var(--pos)" opacity=".12" />
      </svg>
      <div className="mt-2 space-y-2">
        {[
          ["Globalfond Index", "+0,8 %"],
          ["Industribolag B", "+1,2 %"],
          ["Teknikfond", "-0,3 %"],
        ].map(([n, c]) => (
          <div key={n} className="flex items-center justify-between rounded-lg bg-surface-2 px-2 py-1.5 text-[10px]">
            <span className="font-medium">{n}</span>
            <span className={c.startsWith("-") ? "text-neg" : "text-pos"}>{c}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <span className="rounded-full bg-pos py-1 text-center text-[10px] font-semibold text-white">Köp</span>
        <span className="rounded-full bg-neg py-1 text-center text-[10px] font-semibold text-white">Sälj</span>
      </div>
    </div>
  );
}

export function GoalIcon({ kind }: { kind: "kids" | "pension" | "home" }) {
  const s = { stroke: "#0b8a4f", strokeWidth: 2.5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden>
      {kind === "kids" ? (
        <>
          <circle cx="32" cy="34" r="18" {...s} />
          <path d="M26 22c2-6 10-8 14-3" {...s} />
          <circle cx="25" cy="32" r="1.8" fill="#0b8a4f" />
          <circle cx="39" cy="32" r="1.8" fill="#0b8a4f" />
          <path d="M25 40c4 4 10 4 14 0" {...s} />
        </>
      ) : kind === "pension" ? (
        <>
          <path d="M18 14v24h22l6 14" {...s} />
          <path d="M18 38c-4 6-6 10-6 14M40 38l-4 14" {...s} />
          <path d="M10 54c8 2 36 2 46-4" {...s} />
          <path d="M18 22h16" {...s} />
        </>
      ) : (
        <>
          <path d="M12 30 32 14l20 16" {...s} />
          <path d="M18 26v24h28V26" {...s} />
          <path d="M28 50V38h8v12" {...s} />
          <path d="M44 12v8" {...s} />
        </>
      )}
    </svg>
  );
}

export function TrustBadge() {
  return (
    <svg viewBox="0 0 260 220" className="h-auto w-full max-w-[260px]" aria-hidden>
      {/* shield */}
      <path d="M90 30 L150 12 L210 30 V95 C210 140 180 170 150 185 C120 170 90 140 90 95Z" fill="var(--surface)" stroke="var(--fg)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M102 38 L150 24 L198 38 V95 C198 132 174 158 150 171 C126 158 102 132 102 95Z" fill="var(--mint-strong)" />
      <path d="M128 98 l15 15 l30 -32" stroke="#0b8a4f" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* rosette */}
      <g transform="translate(70 140)">
        <path d="M-14 20 L-22 62 L-4 52 L6 68 L12 26Z" fill="var(--brand)" />
        <path d="M14 20 L24 60 L6 52 L-2 66 L-8 26Z" fill="var(--brand)" opacity=".8" />
        <circle r="34" fill="var(--brand)" />
        <circle r="27" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="2 3" />
        <text textAnchor="middle" y="-3" fontSize="15" fontWeight="800" fill="#fff">0 kr</text>
        <text textAnchor="middle" y="12" fontSize="7.5" fontWeight="700" fill="#fff">COURTAGE*</text>
      </g>
      {/* sparkles */}
      {[
        [230, 50],
        [40, 60],
        [225, 150],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 8}v16M${x - 8} ${y}h16`} stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}
