
// WHAT THIS MIDDLEWARE DOES:
// Intercepts protected HTTP requests before reaching the controller:
// 1. Reads the JWT `token` from incoming HTTP cookies (`req.cookies.token`).
// 2. Verifies the token's cryptographic signature using `process.env.JWT_SECRET`.
// 3. Fetches the authenticated customer document from MongoDB (excluding password).
// 4. Attaches the customer object to `req.user` and calls `next()` to pass control to the controller.

import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Read the HttpOnly cookie named 'token'
    const token = req.cookies.token;

    // If no token cookie was provided, block the request immediately
    if (!token) {
      // HTTP 401 Unauthorized
      return res.status(401).json({ message: 'Not authorized' });
    }

    // CONCEPT: JWT VERIFICATION
    // `jwt.verify(token, secret)` checks that the JWT signature is valid and hasn't expired.
    // If valid, it returns the decoded token payload (which contains `{ id: customer._id }`).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CONCEPT: MONGOOSE PROJECTION (`select('-password')`)
    // Fetches customer by ID. `.select('-password')` tells Mongoose to EXCLUDE the `password` field
    // from the returned MongoDB document for security.
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Attach customer object to the `req` object so subsequent controllers can access user info
    req.user = customer;

    // CONCEPT: `next()` FUNCTION
    // `next()` signals to Express that this middleware step is complete and execution should proceed
    // to the next middleware or final controller handler in the pipeline.
    next();
  } catch (error) {
    // If token verification fails (e.g., token expired or tampered with), return 401
    return res.status(401).json({ message: 'Not authorized' });
  }
};

export default authMiddleware;
