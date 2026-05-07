// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // This signs the token with your secret key and makes it expire in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;