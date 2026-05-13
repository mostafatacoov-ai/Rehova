const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/userModel');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected');
  
  // Find a user to test
  const user = await User.findOne();
  if (!user) {
    console.log('No user found');
    process.exit(1);
  }

  console.log('Testing update on user:', user.email);

  try {
    user.name = user.name + ' '; // Trigger a change
    
    // Simulate what the frontend sends for addresses
    user.addresses = []; 

    await user.save();
    console.log('Save successful!');
  } catch (error) {
    console.error('🔥 Mongoose Save Error:', error);
  }

  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
