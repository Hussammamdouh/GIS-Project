const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Place = require('../models/Place');

const testPlace = {
  name: 'Test Cafe',
  category: 'cafe',
  location: {
    type: 'Point',
    coordinates: [55.2708, 25.2048]
  }
};

const testUserLocation = {
  lat: 25.2048,
  lng: 55.2708
};

let server;

beforeAll(async () => {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/localfindr-test';
  process.env.PORT = 5001;
  await mongoose.connect(process.env.MONGODB_URI);
  server = app.listen(process.env.PORT);
});

afterAll(async () => {
  await mongoose.connection.close();
  await server.close();
});

beforeEach(async () => {
  await Place.deleteMany({});
});

describe('Place API Tests', () => {
  test('should create a new place', async () => {
    const res = await request(app)
      .post('/api/places')
      .send(testPlace);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(testPlace.name);
  });

  test('should get all places', async () => {
    await Place.create(testPlace);
    const res = await request(app).get('/api/places');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
  });

  test('should get place by id', async () => {
    const place = await Place.create(testPlace);
    const res = await request(app).get(`/api/places/${place._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(testPlace.name);
  });

  test('should update place', async () => {
    const place = await Place.create(testPlace);
    const updateData = { name: 'Updated Cafe' };
    const res = await request(app)
      .put(`/api/places/${place._id}`)
      .send(updateData);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(updateData.name);
  });

  test('should delete place', async () => {
    const place = await Place.create(testPlace);
    const res = await request(app).delete(`/api/places/${place._id}`);
    expect(res.statusCode).toBe(200);
    const deletedPlace = await Place.findById(place._id);
    expect(deletedPlace).toBeNull();
  });

  test('should get nearby places', async () => {
    try {
      const place = await Place.create(testPlace);
      await place.save();

      const res = await request(app)
        .get('/api/places/nearby')
        .query({
          lat: testUserLocation.lat,
          lng: testUserLocation.lng,
          category: 'cafe',
          radius: 5
        });
      
      if (res.statusCode !== 200) {
        console.error('Response body:', res.body);
        console.error('Response status:', res.statusCode);
      }
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  test('should calculate distance to place', async () => {
    const place = await Place.create(testPlace);
    const res = await request(app)
      .get(`/api/places/${place._id}/distance`)
      .query({
        lat: testUserLocation.lat,
        lng: testUserLocation.lng
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('distanceInMeters');
  });
}); 