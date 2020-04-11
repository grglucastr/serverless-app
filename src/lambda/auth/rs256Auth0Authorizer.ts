import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support';

import { verify } from 'jsonwebtoken';
import { JwtToken } from '../../auth/jwtToken';

const cert = `-----BEGIN CERTIFICATE-----
MIIC/TCCAeWgAwIBAgIJSHOHIdsaMbMhMA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV
BAMTEWdyZ3Rlc3QuYXV0aDAuY29tMB4XDTIwMDQxMDIwMTA1NloXDTMzMTIxODIw
MTA1NlowHDEaMBgGA1UEAxMRZ3JndGVzdC5hdXRoMC5jb20wggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQDr5u2vzRgPXli4Cqz8mzz0w6tzp7nhIWTmPowo
mdfs4Ec48B7FecqLE5rhLAtduIyeNMUOcNAqLnmeJIdpEXpIbK/bLVqL4v5mqHWP
pH37gmMKVpBSzjRTThPKgU4w0iaM7mMw9RYaJnqXoOMVmdOVkh7zFQEdZL6BIOFv
8eco+shN5+vu72PJcSU6JTCHQZP4mdYvFrIgxmFujJCoSJsWj5hvFRlUVxiTl7B+
57oCvc6iIj3FEBh14Qq/7xlCkNrfvDXfQNy03e9l2642a2CnUm11c3l3+6Iaep70
6Vlng4Jhe4V3qekTOkieSLv5mHZv7FiuuhMxEDrcg9VCTuIxAgMBAAGjQjBAMA8G
A1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFMBoBsID/jKzqMnbvoXAe7U6MXs9MA4G
A1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAzcU0ofmEo6ZlCItO0wYy
576cxzDFH7wuNgMVJqf0tGJnfsHq3H+WRXd7+IUUUiiKhiKb+KAQixoiqQB4qZg5
favAJX9LuHoNztHQOA98x/tv9zP7tDiupBDiVnJM/aLLhua6e8m7LHUj2reBAb2Q
s37t6xDpCAa0wVjJBWyiEbqQIMXrDMI/gf2Q71fgPze7KUQFCq7oBaqcdfZcLBqo
4AWEi3jpknRfxQJkTyYGShz80ahRzM8nI695w/bUH/3AG55qni2L49kxJnGHgIrV
0lA5uqkWZgrOrvGnaR0AbCxr6AV/h+tDjpU60d3snejUi4Sf38TptQrMETVsLfx4
dg==
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try{
        const jwtToken = verifyToken(event.authorizationToken);
        console.log('User was authorized: ', jwtToken);
        
        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }

    } catch(e) {
        console.log('User was not authorized', e.message);
        
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }

    }
}

function verifyToken(authHeader: string): JwtToken {
    if(!authHeader){
        throw new Error('No authorization header');
    }
            
    if(!authHeader.toLocaleLowerCase().startsWith('bearer ')){
        throw new Error('Invalid authorization header');
    }

    const split = authHeader.split(' ');
    const token = split[1];
    return verify(token, cert, {algorithms: ['RS256']}) as JwtToken;
}