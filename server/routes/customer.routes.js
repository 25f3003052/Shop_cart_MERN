
import express from 'express';
import {registerCustomer,loginCustomer,getCurrentCustomer,logoutCustomer,} from '../controllers/customer.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

// Create a new Express Router instance
const router = express.Router();

router.post('/register', registerCustomer);

router.post('/login', loginCustomer);


//   - If token is missing/invalid: `authMiddleware` returns HTTP 401 and STOPS the pipeline.
//   - If token is valid: `authMiddleware` attaches customer object to `req.user` and calls `next()`.
//   - `getCurrentCustomer` controller then executes and returns profile details.
router.get('/me', authMiddleware, getCurrentCustomer);

router.post('/logout', logoutCustomer);

// Export the router instance so it can be imported and mounted in `index.js`
export default router;
