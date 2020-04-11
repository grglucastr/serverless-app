import { decode } from 'jsonwebtoken';
import { JwtToken } from './JwtToken';

/***
 * Parse a JWT Token and return a user id
 * @param jwtToken JWT token to parse 
 * @returns a user id from the JWT Token
 */
export function getUserId(jwtToken: string): string {
    const decodedJwt = decode(jwtToken) as JwtToken;
    return decodedJwt.sub;
}