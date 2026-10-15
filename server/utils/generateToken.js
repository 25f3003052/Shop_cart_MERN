
// A JWT is a compact, URL-safe standard (RFC 7519) for transmitting secure claims between two parties.

// A JWT TOKEN CONSISTS OF 3 PARTS SEPARATED BY DOTS (`.`):
// 1. Header    --> Specifies algorithm (e.g., HS256) and token type (JWT).
// 2. Payload   --> Contains data/claims (e.g. user ID `{ id }`). Note: Payload is Base64 encoded, NOT encrypted!
// 3. Signature --> Cryptographic signature produced using (Header + Payload + SecretKey).
//    The signature allows the server to verify that the token was not tampered with.

import jwt from 'jsonwebtoken';

// Helper utility function to generate a signed JWT token
const generateToken = (id) => {
  // `jwt.sign(payload, secret, options)`
  // - `payload`: Object containing user identifiers `{ id }`.
  // - `process.env.JWT_SECRET`: Secret key string stored in environment variables.
  // - `expiresIn: '1d'`: Specifies token validity period (1 day). Afterwards, token expires.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export default generateToken;



