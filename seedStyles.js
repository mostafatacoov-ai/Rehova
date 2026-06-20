require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const sampleProduct = new Product({
      name: 'Rehova Signature Hoodie (Styled)',
      price: 1500,
      description: 'A premium quality hoodie featuring our new Styles variant system. Choose between style S, M, or A!',
      countInStock: 50,
      image: '/images/sample.jpg',
      category: 'Hoodies',
      styles: [
        { name: 'S', colorCode: '#ff0000' }, // Red
        { name: 'M', colorCode: '#00ff00' }, // Green
        { name: 'A', colorCode: '#0000ff' }  // Blue
      ]
    });

    await sampleProduct.save();
    console.log('Sample product with Styles created!');
    process.exit(0);
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedData();
