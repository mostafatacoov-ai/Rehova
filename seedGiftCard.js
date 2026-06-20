const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');
const User = require('./models/userModel');

dotenv.config();

const seedGiftCard = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('No admin user found to associate product with.');
      process.exit(1);
    }

    const cards = [
      { name: 'Digital Gift Card (500 EGP)', price: 500 },
      { name: 'Digital Gift Card (1000 EGP)', price: 1000 },
      { name: 'Digital Gift Card (2000 EGP)', price: 2000 }
    ];

    for (const card of cards) {
      const existing = await Product.findOne({ name: card.name });
      if (!existing) {
        const gc = new Product({
          user: adminUser._id,
          name: card.name,
          image: 'https://placehold.co/600x400/ff3366/ffffff?text=Rehova+Gift+Card',
          brand: 'Rehova',
          category: 'Gift Card',
          description: `Give the gift of choice with a ${card.price} EGP Rehova Gift Card. The digital code will be instantly assigned to your account upon purchase.`,
          price: card.price,
          countInStock: 99999,
          rating: 5,
          numReviews: 1,
        });
        await gc.save();
        console.log(`Created ${card.name}!`);
      } else {
        console.log(`${card.name} already exists.`);
      }
    }
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedGiftCard();
