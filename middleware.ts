import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("TTTTTTTTTTTTTTTTTT", token);

  const publicRoutes = [
    "/login",
    "/forgot-password",
    "/update-password",
    "/verify-otp",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isStatic = pathname.startsWith("/_next") || pathname.includes(".");

  // Redirect unauthenticated users trying to access protected routes
  // if (!token && !isPublicRoute && !isStatic) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  // }

  // Redirect authenticated users away from public routes
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Restrict /dashboard to sellers only
  if (pathname.startsWith("/dashboard")) {
    if (!token || token.role !== "seller") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // const isOnSettingsPage = pathname === "/dashboard/settings";

    // if (
    //   !isOnSettingsPage &&
    //   (!token.stripeAccountId || token.stripeAccountId === "")
    // ) {
    //   return NextResponse.redirect(new URL("/dashboard/settings", request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
