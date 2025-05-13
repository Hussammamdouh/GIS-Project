const Place = require('../models/Place');

exports.createPlace = async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json(place);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!place) return res.status(404).json({ message: 'Not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, category, radius } = req.query;
    
    if (!lat || !lng || !radius) {
      return res.status(400).json({ message: 'Latitude, longitude, and radius are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseFloat(radius) * 1000;

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInMeters)) {
      return res.status(400).json({ message: 'Invalid numeric parameters' });
    }

    const query = {};
    if (category) {
      query.category = category;
    }

    const places = await Place.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radiusInMeters,
          query: query
        }
      },
      { $limit: 5 }
    ]);

    res.json(places);
  } catch (err) {
    console.error('Error in getNearbyPlaces:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.getDistanceToPlace = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });

    const result = await Place.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          spherical: true,
          query: { _id: place._id }
        }
      },
      { $limit: 1 }
    ]);

    if (!result.length) return res.status(404).json({ message: 'Distance not found' });

    res.json({ distanceInMeters: result[0].distance });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};
