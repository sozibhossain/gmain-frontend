import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser } from "@/app/actions/auth";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "email@example.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const result = await loginUser({
                    email: credentials.email,
                    password: credentials.password,
                });

                if (!result.success || !result.data) {
                    throw new Error(result.message || "Invalid credentials");
                }


                const user = result.data;

          
                return {
                    id: user._id,
                    role: user.data.role,
                    farm: user.data.user.farm,
                    stripeAccountId: user.data.user.stripeAccountId,
                    accessToken: user.data.accessToken,
                    refreshToken: user.data.refreshToken,
                };
            }

        }),
    ],
    pages: {
        signIn: "/login",
        signOut: "/logout",
        error: "/auth/error",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.farm =  user.farm;
                token.stripeAccountId = user.stripeAccountId;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
            }
            return token;
        },
      async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role as string;
    session.user.farm = token.farm as string;
  }

  session.accessToken = token.accessToken as string;
    session.stripeAccountId = token.stripeAccountId as string;
  session.refreshToken = token.refreshToken as string;

  return session;
}


    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
