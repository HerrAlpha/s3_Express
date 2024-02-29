const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      // Add this line to use the new Server Discovery and Monitoring engine
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
    });
    
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectToDatabase;
