const axios = require('axios');
const User = require('../models/User');

exports.searchNearbyGooglePlaces = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data.results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch from Google Places', error: err.message });
  }
};

exports.addFavoritePlace = async (req, res) => {
  try {
    const { userId, placeId, name, address } = req.body;
    if (!userId || !placeId || !name || !address) {
      return res.status(400).json({ message: 'All fields (userId, placeId, name, address) are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = user.favorites.find((f) => f.placeId === placeId);
    if (exists) {
      return res.status(400).json({ message: 'Place already in favorites' });
    }

    const newFavorite = { placeId, name, address };
    user.favorites.push(newFavorite);
    await user.save();
    
    res.status(201).json(newFavorite);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save favorite', error: err.message });
  }
};

exports.getFavoritePlaces = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch favorites', error: err.message });
  }
};
