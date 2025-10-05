import Joi from 'joi';

const createMemorySchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  content: Joi.string()
    .trim()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Content is required',
      'string.min': 'Content must be at least 1 character',
      'string.max': 'Content cannot exceed 2000 characters'
    }),
  category: Joi.string()
    .valid('Travel', 'Learning', 'Growth', 'Fun')
    .required()
    .messages({
      'any.only': 'Category must be Travel, Learning, Growth, or Fun'
    }),
  importance: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .default(5)
    .messages({
      'number.min': 'Importance must be at least 1',
      'number.max': 'Importance cannot exceed 10'
    }),
  date: Joi.date()
    .default(Date.now)
    .messages({
      'date.base': 'Date must be a valid date'
    }),
  relatedIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .default([])
    .messages({
      'array.base': 'Related IDs must be an array',
      'string.pattern.base': 'Related ID must be a valid ObjectId'
    }),
  media: Joi.array()
    .items(Joi.string().uri())
    .default([])
    .messages({
      'array.base': 'Media must be an array',
      'string.uri': 'Media must be a valid URL'
    }),
  tags: Joi.array()
    .items(Joi.string().trim().max(20))
    .default([])
    .messages({
      'array.base': 'Tags must be an array',
      'string.max': 'Tag cannot exceed 20 characters'
    }),
  isPublic: Joi.boolean()
    .default(false)
});

const updateMemorySchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  content: Joi.string()
    .trim()
    .min(1)
    .max(2000)
    .messages({
      'string.min': 'Content must be at least 1 character',
      'string.max': 'Content cannot exceed 2000 characters'
    }),
  category: Joi.string()
    .valid('Travel', 'Learning', 'Growth', 'Fun')
    .messages({
      'any.only': 'Category must be Travel, Learning, Growth, or Fun'
    }),
  importance: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .messages({
      'number.min': 'Importance must be at least 1',
      'number.max': 'Importance cannot exceed 10'
    }),
  date: Joi.date()
    .messages({
      'date.base': 'Date must be a valid date'
    }),
  relatedIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .messages({
      'array.base': 'Related IDs must be an array',
      'string.pattern.base': 'Related ID must be a valid ObjectId'
    }),
  media: Joi.array()
    .items(Joi.string().uri())
    .messages({
      'array.base': 'Media must be an array',
      'string.uri': 'Media must be a valid URL'
    }),
  tags: Joi.array()
    .items(Joi.string().trim().max(20))
    .messages({
      'array.base': 'Tags must be an array',
      'string.max': 'Tag cannot exceed 20 characters'
    }),
  isPublic: Joi.boolean()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export {
  createMemorySchema,
  updateMemorySchema
};
