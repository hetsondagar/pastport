import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { connectDB, disconnectDB } from '../config/database.js';

describe('Notifications', () => {
  let authToken;
  let userId;
  let recipientId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});

    // Create test users
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    };

    const recipientData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    };

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    const recipientResponse = await request(app)
      .post('/api/auth/register')
      .send(recipientData);

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user._id;
    recipientId = recipientResponse.body.data.user._id;
  });

  describe('GET /api/notifications', () => {
    beforeEach(async () => {
      // Create test notifications
      const notifications = [
        {
          recipient: userId,
          type: 'friend_request',
          title: 'Friend Request',
          message: 'You have a new friend request',
          data: { userId: recipientId }
        },
        {
          recipient: userId,
          type: 'capsule_unlocked',
          title: 'Capsule Unlocked',
          message: 'Your capsule is now unlocked',
          data: { capsuleId: '507f1f77bcf86cd799439011' }
        }
      ];

      await Notification.insertMany(notifications);
    });

    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(2);
    });

    it('should not get notifications without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get('/api/notifications?type=friend_request')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].type).toBe('friend_request');
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    let notificationId;

    beforeEach(async () => {
      const notification = new Notification({
        recipient: userId,
        type: 'friend_request',
        title: 'Friend Request',
        message: 'You have a new friend request',
        data: { userId: recipientId }
      });

      await notification.save();
      notificationId = notification._id;
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('marked as read');

      // Verify notification is marked as read
      const updatedNotification = await Notification.findById(notificationId);
      expect(updatedNotification.isRead).toBe(true);
      expect(updatedNotification.readAt).toBeDefined();
    });

    it('should not mark notification as read without authentication', async () => {
      const response = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not mark non-existent notification as read', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    beforeEach(async () => {
      // Create test notifications
      const notifications = [
        {
          recipient: userId,
          type: 'friend_request',
          title: 'Friend Request 1',
          message: 'You have a new friend request',
          isRead: false
        },
        {
          recipient: userId,
          type: 'friend_request',
          title: 'Friend Request 2',
          message: 'You have another friend request',
          isRead: false
        }
      ];

      await Notification.insertMany(notifications);
    });

    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('marked as read');

      // Verify all notifications are marked as read
      const notifications = await Notification.find({ recipient: userId });
      notifications.forEach(notification => {
        expect(notification.isRead).toBe(true);
        expect(notification.readAt).toBeDefined();
      });
    });

    it('should not mark all notifications as read without authentication', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let notificationId;

    beforeEach(async () => {
      const notification = new Notification({
        recipient: userId,
        type: 'friend_request',
        title: 'Friend Request',
        message: 'You have a new friend request',
        data: { userId: recipientId }
      });

      await notification.save();
      notificationId = notification._id;
    });

    it('should delete notification', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify notification is deleted
      const deletedNotification = await Notification.findById(notificationId);
      expect(deletedNotification).toBeNull();
    });

    it('should not delete notification without authentication', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
