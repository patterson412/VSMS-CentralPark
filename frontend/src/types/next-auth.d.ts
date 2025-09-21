import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      username: string;
      role: string;
      createdAt: string;
    };
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

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    user?: {
      id: string;
      username: string;
      role: string;
      createdAt: string;
    };
  }
}