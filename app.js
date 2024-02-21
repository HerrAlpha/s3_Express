const express = require('express');
const connectToDatabase = require('./database/database');
const router = require('./route/route');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    console.log('MongoDB connected');
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

// Serve static files (e.g., HTML)
app.use(express.static('views'));

// Use routes
app.use('/', router);
