import NextAuth from 'next-auth';
import { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authApi } from '@/lib/api';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      username: string;
      role: string;
      createdAt: string;
    } & DefaultSession['user'];
  }

  interface User {
    accessToken?: string;
    role?: string;
    user?: {
      id: string;
      username: string;
      role: string;
      createdAt: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    accessToken?: string;
    user?: {
      id?: string;
      username?: string;
      role?: string;
      createdAt?: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const data = await authApi.login({
            username: credentials.username as string,
            password: credentials.password as string,
          });

          if (data.access_token && data.user) {
            return {
              id: data.user.id,
              name: data.user.username,
              accessToken: data.access_token,
              role: 'admin',
              user: {
                ...data.user,
                role: 'admin'
              },
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.user = {
          ...user.user,
          role: user.role || 'admin',
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = {
        ...session.user,
        id: token.user?.id || '',
        username: token.user?.username || '',
        role: token.user?.role || 'admin',
        createdAt: token.user?.createdAt || '',
      };
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});