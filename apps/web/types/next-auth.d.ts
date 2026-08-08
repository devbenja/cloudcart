import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            roles: string[];
        } & DefaultSession['user'];
        accessToken?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        roles?: string[];
        accessToken?: string;
    }
}
