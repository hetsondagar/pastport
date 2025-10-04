import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Capsule from '../models/Capsule.js';
import { connectDB, disconnectDB } from '../config/database.js';

describe('Capsules', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Capsule.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Capsule.deleteMany({});

    // Create test user
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = response.body.data.token;
    userId = response.body.data.user._id;
  });

  describe('POST /api/capsules', () => {
    it('should create a new capsule with valid data', async () => {
      const capsuleData = {
        title: 'My First Capsule',
        description: 'This is my first time capsule',
        unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isPublic: false,
        tags: ['memories', 'family']
      };

      const response = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .send(capsuleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.capsule.title).toBe(capsuleData.title);
      expect(response.body.data.capsule.creator.toString()).toBe(userId);
    });

    it('should not create capsule without authentication', async () => {
      const capsuleData = {
        title: 'My First Capsule',
        description: 'This is my first time capsule',
        unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/capsules')
        .send(capsuleData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    it('should not create capsule with invalid data', async () => {
      const invalidData = {
        title: 'A', // Too short
        description: 'This is my first time capsule',
        unlockDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Past date
      };

      const response = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/capsules', () => {
    beforeEach(async () => {
      // Create test capsules
      const capsules = [
        {
          title: 'Capsule 1',
          description: 'First capsule',
          creator: userId,
          unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isPublic: true
        },
        {
          title: 'Capsule 2',
          description: 'Second capsule',
          creator: userId,
          unlockDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
          isPublic: false
        }
      ];

      await Capsule.insertMany(capsules);
    });

    it('should get user capsules', async () => {
      const response = await request(app)
        .get('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.capsules).toHaveLength(2);
    });

    it('should get public capsules', async () => {
      const response = await request(app)
        .get('/api/capsules/public')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.capsules).toHaveLength(1);
    });
  });

  describe('GET /api/capsules/:id', () => {
    let capsuleId;

    beforeEach(async () => {
      const capsule = new Capsule({
        title: 'Test Capsule',
        description: 'Test description',
        creator: userId,
        unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isPublic: true
      });

      await capsule.save();
      capsuleId = capsule._id;
    });

    it('should get capsule by ID', async () => {
      const response = await request(app)
        .get(`/api/capsules/${capsuleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.capsule.title).toBe('Test Capsule');
    });

    it('should not get non-existent capsule', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/capsules/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/capsules/:id', () => {
    let capsuleId;

    beforeEach(async () => {
      const capsule = new Capsule({
        title: 'Test Capsule',
        description: 'Test description',
        creator: userId,
        unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isPublic: false
      });

      await capsule.save();
      capsuleId = capsule._id;
    });

    it('should update capsule with valid data', async () => {
      const updateData = {
        title: 'Updated Capsule',
        description: 'Updated description',
        isPublic: true
      };

      const response = await request(app)
        .put(`/api/capsules/${capsuleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.capsule.title).toBe('Updated Capsule');
    });

    it('should not update capsule without authentication', async () => {
      const updateData = {
        title: 'Updated Capsule'
      };

      const response = await request(app)
        .put(`/api/capsules/${capsuleId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/capsules/:id', () => {
    let capsuleId;

    beforeEach(async () => {
      const capsule = new Capsule({
        title: 'Test Capsule',
        description: 'Test description',
        creator: userId,
        unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isPublic: false
      });

      await capsule.save();
      capsuleId = capsule._id;
    });

    it('should delete capsule', async () => {
      const response = await request(app)
        .delete(`/api/capsules/${capsuleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify capsule is deleted
      const deletedCapsule = await Capsule.findById(capsuleId);
      expect(deletedCapsule).toBeNull();
    });

    it('should not delete capsule without authentication', async () => {
      const response = await request(app)
        .delete(`/api/capsules/${capsuleId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
