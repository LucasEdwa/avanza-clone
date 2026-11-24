import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <Logo />
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-muted">Sidan du letar efter finns inte eller har flyttats.</p>
      <div className="flex gap-2">
        <Link href="/" className="btn-secondary">
          Startsidan
        </Link>
        <Link href="/marknad" className="btn-primary">
          Marknaden idag
        </Link>
      </div>
    </div>
  );
}
