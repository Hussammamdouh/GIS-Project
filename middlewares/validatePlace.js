const { body, validationResult, query } = require('express-validator');

exports.validatePlace = [
  body('name').notEmpty(),
  body('category').notEmpty(),
  body('location.type').equals('Point'),
  body('location.coordinates').isArray({ min: 2, max: 2 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

exports.validateNearbyQuery = [
  query('lat').notEmpty().isFloat(),
  query('lng').notEmpty().isFloat(),
  query('category').optional().notEmpty(),
  query('radius').notEmpty().isFloat(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

exports.validateDistanceQuery = [
  query('lat').notEmpty().isFloat(),
  query('lng').notEmpty().isFloat(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];
