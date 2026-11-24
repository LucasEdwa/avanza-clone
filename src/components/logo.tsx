import Link from "next/link";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <path
        d="M16 25c0-6 0-9-4.5-12.5M16 25c0-5 1-8 6-10.5M16 25V14"
        stroke="var(--brand-fg)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="10.5" r="2.6" fill="var(--brand-fg)" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold tracking-tight text-fg">
      <LogoMark />
      <span className="text-xl">spira</span>
    </Link>
  );
}
