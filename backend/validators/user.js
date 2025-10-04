import Joi from 'joi';

// Update profile validation
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  bio: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Bio cannot exceed 500 characters'
    }),
  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    })
});

// Update preferences validation
export const updatePreferencesSchema = Joi.object({
  theme: Joi.string()
    .valid('light', 'dark', 'auto')
    .optional(),
  notifications: Joi.object({
    email: Joi.boolean()
      .optional(),
    push: Joi.boolean()
      .optional(),
    unlockReminders: Joi.boolean()
      .optional()
  }).optional(),
  privacy: Joi.object({
    profileVisibility: Joi.string()
      .valid('public', 'friends', 'private')
      .optional(),
    showBadges: Joi.boolean()
      .optional()
  }).optional()
});

// Send friend request validation
export const sendFriendRequestSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Respond to friend request validation
export const respondToFriendRequestSchema = Joi.object({
  requestId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid request ID format'
    }),
  action: Joi.string()
    .valid('accept', 'decline')
    .required()
    .messages({
      'any.only': 'Action must be either "accept" or "decline"'
    })
});

// Remove friend validation
export const removeFriendSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Search users validation
export const searchUsersSchema = Joi.object({
  query: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Search query is required',
      'string.min': 'Search query must be at least 1 character',
      'string.max': 'Search query cannot exceed 100 characters'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
});

// Update user role validation (admin only)
export const updateUserRoleSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format'
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .required()
    .messages({
      'any.only': 'Role must be either "user" or "admin"'
    })
});

// Deactivate user validation (admin only)
export const deactivateUserSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format'
    })
});
