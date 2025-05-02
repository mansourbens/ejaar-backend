export interface JwtPayload {
    sub: number;  // user id
    email: string;
    lastConnection?: string;
}
