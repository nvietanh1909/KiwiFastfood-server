const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/mongo-config');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware cors
app.use(cors());

app.use(express.json());

connectDB();

// Default route
app.get('/', (req, res) => {
  res.send('Kiwi Fast Food API');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });