const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const {
    validatePlace,
    validateNearbyQuery,
    validateDistanceQuery
  } = require('../middlewares/validatePlace');

router.post('/', validatePlace, placeController.createPlace);
router.get('/', placeController.getAllPlaces);
router.get('/:id', placeController.getPlaceById);
router.put('/:id', placeController.updatePlace);
router.delete('/:id', placeController.deletePlace);
router.get('/nearby', validateNearbyQuery, placeController.getNearbyPlaces);
router.get('/:id/distance', validateDistanceQuery, placeController.getDistanceToPlace);

module.exports = router;
