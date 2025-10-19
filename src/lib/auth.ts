import { type NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // TODO: Descomentar cuando BD esté configurada
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith(frontendUrl)) return url;
      
      return `${frontendUrl}/dashboard`;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
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

  secret: process.env.NEXTAUTH_SECRET,
};

export const getSession = () => getServerSession(authOptions);