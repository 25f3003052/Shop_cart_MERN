import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,      // Specifies that `fullName` must be a String data type.
    required: true,    // Validation: Ensures this field cannot be empty or omitted.
    trim: true,        // Sanitization: Automatically strips leading/trailing whitespace.
  },
  email: {
    type: String,
    required: true,
    unique: true,      // Index Constraint: Ensures no two documents can have the same email address in MongoDB.
    trim: true,
    lowercase: true,   // Sanitization: Converts input email to lowercase before saving.
  },
  password: {
    type: String,      // Stores the bcrypt-hashed password string.
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  wishlist: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    default: [],
  },
  cart: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    default: [],
  },
});


const Customer = mongoose.model('Customer', customerSchema);

// Export the Customer model for database CRUD operations in controllers
export default Customer;
