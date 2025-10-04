import Joi from 'joi';

// Create journal entry validation
export const createJournalEntrySchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Content is required',
      'string.min': 'Content must be at least 1 character',
      'string.max': 'Content cannot exceed 5000 characters'
    }),
  mood: Joi.string()
    .valid('happy', 'sad', 'excited', 'angry', 'calm', 'neutral')
    .optional()
    .default('neutral')
    .messages({
      'any.only': 'Mood must be one of: happy, sad, excited, angry, calm, neutral'
    }),
  date: Joi.date()
    .optional()
    .default(() => new Date())
    .messages({
      'date.base': 'Date must be a valid date'
    }),
  isCapsule: Joi.boolean()
    .optional()
    .default(false),
  lockType: Joi.string()
    .valid('time', 'riddle', 'none')
    .optional()
    .default('none')
    .messages({
      'any.only': 'Lock type must be one of: time, riddle, none'
    }),
  unlockDate: Joi.date()
    .greater('now')
    .optional()
    .messages({
      'date.base': 'Unlock date must be a valid date',
      'date.greater': 'Unlock date must be in the future'
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
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 30 characters'
    }),
  isPublic: Joi.boolean()
    .optional()
    .default(false)
});

// Update journal entry validation
export const updateJournalEntrySchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .optional()
    .messages({
      'string.min': 'Content must be at least 1 character',
      'string.max': 'Content cannot exceed 5000 characters'
    }),
  mood: Joi.string()
    .valid('happy', 'sad', 'excited', 'angry', 'calm', 'neutral')
    .optional()
    .messages({
      'any.only': 'Mood must be one of: happy, sad, excited, angry, calm, neutral'
    }),
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 30 characters'
    }),
  isPublic: Joi.boolean()
    .optional()
});

// Unlock journal entry validation
export const unlockJournalEntrySchema = Joi.object({
  answer: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Answer cannot exceed 100 characters'
    })
});
