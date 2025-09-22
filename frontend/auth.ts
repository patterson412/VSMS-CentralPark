import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authApi } from '@/lib/api';

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
        token.accessToken = (user as any).accessToken;
        token.user = {
          ...(user as any).user,
          role: (user as any).role || 'admin',
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = {
        ...session.user,
        id: (token.user as any)?.id || '',
        username: (token.user as any)?.username || '',
        role: (token.user as any)?.role || 'admin',
        createdAt: (token.user as any)?.createdAt || '',
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