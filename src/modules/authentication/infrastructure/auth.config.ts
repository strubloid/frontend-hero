import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { compare } from "bcryptjs";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";
import { eq } from "drizzle-orm";
import * as schema from "@/shared/infrastructure/database/schema";

const sqlite = getSqliteConnection();
const db = drizzle(sqlite, { schema });

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: DrizzleAdapter(db, {
    usersTable: schema.players,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/play",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const rows = await db
          .select()
          .from(schema.players)
          .where(eq(schema.players.email, email))
          .limit(1);

        const player = rows[0];
        if (!player || !player.passwordHash) return null;

        const isValid = await compare(password, player.passwordHash);
        if (!isValid) return null;

        return {
          id: player.id,
          name: player.name,
          email: player.email ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
