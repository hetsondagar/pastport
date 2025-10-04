import Joi from 'joi';

// Create capsule validation
export const createCapsuleSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  message: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 1 character',
      'string.max': 'Message cannot exceed 5000 characters'
    }),
  emoji: Joi.string()
    .trim()
    .max(10)
    .optional()
    .default('📝')
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),
  mood: Joi.string()
    .valid('happy', 'sad', 'excited', 'angry', 'calm', 'neutral')
    .optional()
    .default('neutral')
    .messages({
      'any.only': 'Mood must be one of: happy, sad, excited, angry, calm, neutral'
    }),
  lockType: Joi.string()
    .valid('time', 'riddle')
    .optional()
    .default('time')
    .messages({
      'any.only': 'Lock type must be either time or riddle'
    }),
  riddleQuestion: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Riddle question cannot exceed 500 characters'
    }),
  riddleAnswer: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Riddle answer cannot exceed 100 characters'
    }),
  unlockDate: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.base': 'Unlock date must be a valid date',
      'date.greater': 'Unlock date must be in the future'
    }),
  isPublic: Joi.boolean()
    .default(false),
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 30 characters'
    }),
  media: Joi.array()
    .items(Joi.object({
      type: Joi.string()
        .valid('image', 'video', 'audio', 'document')
        .required(),
      url: Joi.string()
        .uri()
        .required()
        .messages({
          'string.uri': 'Media URL must be a valid URL'
        }),
      caption: Joi.string()
        .trim()
        .max(200)
        .optional()
        .messages({
          'string.max': 'Media caption cannot exceed 200 characters'
        })
    }))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 media items'
    }),
  location: Joi.object({
    name: Joi.string()
      .trim()
      .max(100)
      .optional(),
    coordinates: Joi.object({
      lat: Joi.number()
        .min(-90)
        .max(90)
        .required(),
      lng: Joi.number()
        .min(-180)
        .max(180)
        .required()
    }).optional()
  }).optional()
});

// Update capsule validation
export const updateCapsuleSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  message: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Message cannot exceed 5000 characters'
    }),
  emoji: Joi.string()
    .trim()
    .max(10)
    .optional()
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),
  mood: Joi.string()
    .valid('happy', 'sad', 'excited', 'angry', 'calm', 'neutral')
    .optional()
    .messages({
      'any.only': 'Mood must be one of: happy, sad, excited, angry, calm, neutral'
    }),
  isPublic: Joi.boolean()
    .optional(),
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 30 characters'
    })
});

// Solve riddle validation
export const solveRiddleSchema = Joi.object({
  answer: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Answer is required',
      'string.min': 'Answer must be at least 1 character',
      'string.max': 'Answer cannot exceed 100 characters'
    })
});

// Add comment validation
export const addCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Comment content is required',
      'string.min': 'Comment must be at least 1 character',
      'string.max': 'Comment cannot exceed 500 characters'
    })
});

// Search capsules validation
export const searchCapsulesSchema = Joi.object({
  query: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Search query must be at least 1 character',
      'string.max': 'Search query cannot exceed 100 characters'
    }),
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .max(5)
    .optional()
    .messages({
      'array.max': 'Cannot search with more than 5 tags',
      'string.max': 'Each tag cannot exceed 30 characters'
    }),
  isPublic: Joi.boolean()
    .optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'unlockDate', 'title', 'popularity')
    .default('createdAt'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
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
