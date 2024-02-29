const express = require('express');
const connectToDatabase = require('./database/database');
const router = require('./route/route');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const apps = () => {
  app.listen(port, () => {
    console.log(`\nServer running on port ${port}\n`);
    console.log(`http://localhost:${port}\n`);
    console.log('Press Ctrl+C to stop\n');
  });
  
  // Connect to MongoDB
  connectToDatabase()
    .then(() => {
      console.log('MongoDB connected\n');
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
    });
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false
   }));
  
  // Serve static files (e.g., HTML)
  app.use(express.static('views'));
  
  // Use routes
  app.use('/', router);
}

module.exports = { apps };