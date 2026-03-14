import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize() {
        // Actual auth logic is in auth.ts — this stub satisfies the edge config
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const publicRoutes = ["/", "/listings", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email"];
      const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith("/listings/") || pathname.startsWith("/users/") || pathname.startsWith("/api/")
      );

      if (isPublicRoute) return true;
      if (!isLoggedIn) return false;

      if (pathname.startsWith("/admin")) {
        const role = auth?.user?.role;
        if (role !== "ADMIN") return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
};
