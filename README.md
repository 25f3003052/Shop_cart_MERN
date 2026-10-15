# ShopKart

ShopKart is a full-stack e-commerce web application built with the MERN stack. It includes user authentication, product browsing, cart management, wishlist, checkout, and order tracking.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication

### Payments
- Razorpay
- Stripe

## Project Structure

```bash
Shopkart/
├── client/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── server/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── index.js
│   └── package.json
├── package.json
├── README.md
└── .gitignore
```

## Features

- User registration and login
- JWT-based authentication
- Product listing and details
- Add to cart and quantity updates
- Wishlist management
- Checkout with shipping details
- Order creation and payment integration
- Order history and order details page
- Protected routes for authenticated users

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Shopkart
```

### 2. Install dependencies

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

### 3. Environment Variables

Create a `.env` file inside the `server` folder with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5023

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

STRIPE_KEY_SECRET=your_stripe_secret_key
STRIPE_KEY_ID=your_stripe_publishable_key
```

Also create a `.env` file inside the `client` folder:

```env
VITE_API_BASE_URL=http://localhost:5023
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Run the app

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Then open:

```bash
http://localhost:5173
```

## API Overview

### Authentication
- `POST /customers/register`
- `POST /customers/login`
- `POST /customers/logout`

### Products
- `GET /products`
- `GET /products/:id`

### Cart
- `GET /cart`
- `POST /cart/add`
- `PUT /cart/update`
- `DELETE /cart/remove`

### Wishlist
- `GET /wishlist`
- `POST /wishlist/add`
- `DELETE /wishlist/remove`

### Orders
- `POST /orders/create-payment-order`
- `POST /orders/verify-payment`
- `GET /orders`
- `GET /orders/:id`

## Payment Flow

The application supports both Razorpay and Stripe-based payment integration.

- Razorpay is used for payment order creation and signature verification.
- Stripe is used for card-based payment processing via PaymentIntent flow.
- Orders are marked as paid only after successful verification.

## Notes

- This project is designed for local development and demonstration.
- Make sure MongoDB is running before starting the backend.
- Use test keys in development to avoid live transactions.
- https://docs.stripe.com/testing for payment gateway testing (Stripe Doc)

