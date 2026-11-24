import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/min-ekonomi", "/bevakningar", "/kursvarningar", "/notiser", "/profil", "/handla"];

/** Optimistic check only – real session validation happens in the server (requireUser). */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!req.cookies.get("spira_session")) {
      const url = req.nextUrl.clone();
      url.pathname = "/logga-in";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
