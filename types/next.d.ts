import 'next/server';

declare module 'next/server' {
  interface NextRequest {
    user?: {
      id: number;
      username: string | JwtPayload;
    };
  }
}