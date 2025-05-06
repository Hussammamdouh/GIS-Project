const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  favorites: [
    {
      placeId: { type: String, required: true },
      name: { type: String, required: true },
      address: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
