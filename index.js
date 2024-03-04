const express = require('express');
const connectToDatabase = require('./database/database');
const router = require('./route/route');
const bodyParser = require('body-parser');
const { basic, style, reset, warning } = require('./library/console-style');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

  // Connect to MongoDB
  connectToDatabase()
    .then(() => {
      console.log('MongoDB connected\n');
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1); // Exit the process if MongoDB connection fails
    });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  
  // Serve static files (e.g., HTML)
  app.use(express.static('views'));
  
  // Use routes
  app.use('/', router);

  // Start the Express.js server
  const server = app.listen(port, () => {
    console.log(`\n${basic.green}${style.bold}Server running on port ${port}\n${reset}`);
    console.log(`\n${basic.magenta}http://localhost:${port}\n${reset}`);
    console.log(`${warning.info}   Press Ctrl+C to stop\n`);
  });

  // // Determine the path to nodemon binary
  // const nodemonPath = path.join(__dirname, 'node_modules', '.bin', 'nodemon');

  // // Start nodemon process for development
  // const nodemonProcess = spawn(nodemonPath, [path.join(__dirname, 'index.js')], { stdio: 'inherit' });

  // // Handle nodemon process events
  // nodemonProcess.on('close', (code) => {
  //   console.log(`Nodemon process exited with code ${code}`);
  //   server.close(); // Close the server when nodemon process exits
  // });

  // // Handle errors in the nodemon process
  // nodemonProcess.on('error', (error) => {
  //   console.error('Nodemon process error:', error);
  //   process.exit(1); // Exit the process if there's an error with nodemon
  // });



// module.exports = { apps };
