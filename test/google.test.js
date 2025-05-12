const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Place = require('../models/Place');
const User = require('../models/User');

const testUserLocation = {
  lat: 25.2048,
  lng: 55.2708
};

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  favorites: []
};

const testFavoritePlace = {
  placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  name: 'Test Restaurant',
  address: '123 Test Street, Test City',
  category: 'restaurant',
  location: {
    type: 'Point',
    coordinates: [55.2708, 25.2048]
  }
};

let server;
let testUserId;

beforeAll(async () => {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/localfindr-test';
  process.env.PORT = 5002;
  process.env.GOOGLE_MAPS_API_KEY = 'your-test-api-key';  // Add this
  await mongoose.connect(process.env.MONGODB_URI);
  server = app.listen(process.env.PORT);
});

afterAll(async () => {
  await mongoose.connection.close();
  await server.close();
});

beforeEach(async () => {
  await Place.deleteMany({});
  await User.deleteMany({});
  const user = await User.create(testUser);
  testUserId = user._id; // Store the generated ObjectId
});

describe('Google Places API Tests', () => {
  test('should search nearby places', async () => {
    const res = await request(app)
      .get('/api/google/search')
      .query({
        lat: testUserLocation.lat,
        lng: testUserLocation.lng,
        type: 'restaurant',
        radius: 1000
      });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('should add place to favorites', async () => {
    const res = await request(app)
      .post('/api/google/favorites')
      .send({
        ...testFavoritePlace,
        userId: testUserId // Use the generated ObjectId
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(testFavoritePlace.name);
  });

  test('should get user favorites', async () => {
    // First add a favorite place
    await request(app)
      .post('/api/google/favorites')
      .send({
        userId: testUserId,
        placeId: testFavoritePlace.placeId,
        name: testFavoritePlace.name,
        address: testFavoritePlace.address
      });

    // Then get favorites
    const res = await request(app)
      .get(`/api/google/favorites/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
  });
}); 