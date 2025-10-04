import Joi from 'joi';

// Create notification validation
export const createNotificationSchema = Joi.object({
  recipientId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid recipient ID format'
    }),
  type: Joi.string()
    .valid('friend_request', 'friend_accepted', 'capsule_unlocked', 'capsule_shared', 'system')
    .required()
    .messages({
      'any.only': 'Invalid notification type'
    }),
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Notification title is required',
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  message: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Notification message is required',
      'string.min': 'Message must be at least 1 character',
      'string.max': 'Message cannot exceed 500 characters'
    }),
  data: Joi.object({
    capsuleId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid capsule ID format'
      }),
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid user ID format'
      }),
    action: Joi.string()
      .optional(),
    metadata: Joi.object()
      .optional()
  }).optional()
});

// Mark notification as read validation
export const markNotificationReadSchema = Joi.object({
  notificationId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid notification ID format'
    })
});

// Mark all notifications as read validation
export const markAllNotificationsReadSchema = Joi.object({
  // No body validation needed for this endpoint
});

// Get notifications validation
export const getNotificationsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10),
  type: Joi.string()
    .valid('friend_request', 'friend_accepted', 'capsule_unlocked', 'capsule_shared', 'system')
    .optional(),
  read: Joi.boolean()
    .optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'readAt')
    .default('createdAt'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

// Delete notification validation
export const deleteNotificationSchema = Joi.object({
  notificationId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid notification ID format'
    })
});

// Update notification preferences validation
export const updateNotificationPreferencesSchema = Joi.object({
  email: Joi.boolean()
    .optional(),
  push: Joi.boolean()
    .optional(),
  unlockReminders: Joi.boolean()
    .optional()
});
