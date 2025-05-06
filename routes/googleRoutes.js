const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');

router.get('/search', googleController.searchNearbyGooglePlaces);
router.post('/favorites', googleController.addFavoritePlace);
router.get('/favorites/:userId', googleController.getFavoritePlaces);

module.exports = router;
