// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      farm: string;
    };
    accessToken: string;
    refreshToken: string;
    stripeAccountId?: string;
  }

  interface User {
    id: string;
    role: string;
    farm: string;
    accessToken: string;
    refreshToken: string;
    stripeAccountId?: string; // Optional, as it may not be present for all users
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    farm: string;
    accessToken: string;
    refreshToken: string;
    stripeAccountId?: string; // Optional, as it may not be present for all users
  }
}
