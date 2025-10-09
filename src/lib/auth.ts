// lib/auth.ts (o auth.ts en la raíz)
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; 

export const authOptions: NextAuthOptions = {
  // Usa el Adaptador de Prisma para conectar NextAuth a tu base de datos
  adapter: PrismaAdapter(prisma), 
  
  // Proveedores de Autenticación
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
    strategy: 'jwt', // Se recomienda usar JWT
  },

  // Añade callbacks si necesitas personalizar la información de la sesión/JWT
  // Por ejemplo, para asegurarte de que el user.id esté siempre disponible.
  // Añade callbacks si necesitas personalizar la información de la sesión/JWT
callbacks: {
  // Este callback controla qué datos se incluyen en el JWT
  async jwt({ token, user }) {
    // Cuando el usuario inicia sesión por primera vez, guardamos su id
    if (user) {
      token.id = user.id;
    }
    return token;
  },

  // Este callback controla qué datos se envían al cliente en la sesión
  async session({ session, token }) {
    // Verifica que session.user exista antes de asignar
    if (session.user && token.id) {
      session.user.email = token.id as string; // Tu campo id es String en Prisma
    }
    return session;
  },
},


  secret: process.env.NEXTAUTH_SECRET,
};

// Exporta una función para obtener la sesión fácilmente en los Route Handlers
export const { handlers, auth } = NextAuth(authOptions);