module.exports = (err, req, res, next) => {
    res.status(500).json({ message: 'Server Error', error: err.message });
  };
  