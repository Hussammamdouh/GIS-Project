const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const placeRoutes = require('./routes/placeRoutes');
const errorHandler = require('./middlewares/errorHandler');
const googleRoutes = require('./routes/googleRoutes');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
app.use(errorHandler);
dotenv.config();
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use('/api/places', placeRoutes);
app.use('/api/google', googleRoutes);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('LocalFindr API Running');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
