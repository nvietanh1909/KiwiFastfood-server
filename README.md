# Kiwi FastFood API

A RESTful API for an online fast food ordering system built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Product (food item) management
- Shopping cart functionality
- Order processing
- Admin dashboard capabilities
- Role-based access control

## Project Structure

The project follows a modular architecture using several design patterns:
- Repository Pattern: For database operations
- Service Pattern: For business logic
- Singleton Pattern: For database connection
- Middleware Pattern: For authentication and error handling

```
project/
├── config/
│   └── db.js              # MongoDB connection (Singleton)
├── models/
│   ├── User.js           # Mongoose schema for users
│   ├── Product.js        # Mongoose schema for food items
│   ├── Cart.js           # Mongoose schema for cart
│   └── Order.js          # Mongoose schema for orders
├── repositories/
│   ├── UserRepository.js # Data access for users
│   ├── ProductRepository.js
│   ├── CartRepository.js
│   └── OrderRepository.js
├── services/
│   ├── UserService.js    # Business logic for users
│   ├── ProductService.js
│   ├── CartService.js
│   └── OrderService.js
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── errorHandler.js   # Centralized error handling
├── routes/
│   ├── userRoutes.js     # User-related endpoints
│   ├── productRoutes.js  # Product-related endpoints
│   ├── cartRoutes.js     # Cart-related endpoints
│   ├── orderRoutes.js    # Order-related endpoints
│   └── adminRoutes.js    # Admin-specific endpoints
├── utils/
│   └── validator.js      # Input validation functions
```

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/kiwi-fastfood-server.git
   cd kiwi-fastfood-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/kiwi_fastfood
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. The API will be available at `http://localhost:5000`

## API Documentation

### Authentication Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user and get JWT token

### Product Endpoints

- `GET /api/products` - Get all food items
- `GET /api/products/:id` - Get a specific food item
- `POST /api/products` - Create a new food item (Admin only)
- `PUT /api/products/:id` - Update a food item (Admin only)
- `DELETE /api/products/:id` - Delete a food item (Admin only)

### Cart Endpoints

- `POST /api/cart` - Add an item to cart
- `GET /api/cart` - View cart items
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove an item from cart

### Order Endpoints

- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders for a user
- `GET /api/orders/:id` - Get order details by ID
- `PUT /api/orders/:id` - Update order status (Admin only)

### Admin Endpoints

- `GET /api/admin/orders` - Get all orders (Admin only)
- `GET /api/admin/customers` - Get all customers (Admin only)
- `PUT /api/admin/customers/:id` - Update customer information (Admin only)

## License

This project is licensed under the ISC License. 