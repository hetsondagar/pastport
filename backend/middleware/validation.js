import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Login validation rules
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Capsule validation rules
export const validateCapsule = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters'),
  body('unlockDate')
    .isISO8601()
    .withMessage('Please provide a valid unlock date'),
  body('emoji')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('hasRiddle')
    .optional()
    .isBoolean()
    .withMessage('hasRiddle must be a boolean'),
  body('riddle')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Riddle must be less than 500 characters'),
  body('riddleAnswer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Riddle answer must be less than 100 characters'),
  handleValidationErrors
];

// Riddle answer validation
export const validateRiddleAnswer = [
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required'),
  handleValidationErrors
];
