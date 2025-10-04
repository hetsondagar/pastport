import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PastPort API',
      version: '1.0.0',
      description: 'A time capsule and memory keeper web application API',
      contact: {
        name: 'PastPort Team',
        email: 'support@pastport.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'User avatar URL'
            },
            bio: {
              type: 'string',
              description: 'User biography'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            },
            stats: {
              type: 'object',
              properties: {
                capsulesCreated: { type: 'number' },
                capsulesUnlocked: { type: 'number' },
                riddlesSolved: { type: 'number' },
                friendsCount: { type: 'number' },
                joinedAt: { type: 'string', format: 'date-time' }
              }
            },
            preferences: {
              type: 'object',
              properties: {
                theme: { type: 'string', enum: ['light', 'dark', 'auto'] },
                notifications: {
                  type: 'object',
                  properties: {
                    email: { type: 'boolean' },
                    push: { type: 'boolean' },
                    unlockReminders: { type: 'boolean' }
                  }
                },
                privacy: {
                  type: 'object',
                  properties: {
                    profileVisibility: { type: 'string', enum: ['public', 'friends', 'private'] },
                    showBadges: { type: 'boolean' }
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Capsule: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Capsule ID'
            },
            title: {
              type: 'string',
              description: 'Capsule title'
            },
            description: {
              type: 'string',
              description: 'Capsule description'
            },
            creator: {
              type: 'string',
              description: 'Creator user ID'
            },
            unlockDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when capsule can be unlocked'
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether capsule is public'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Capsule tags'
            },
            riddle: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                answer: { type: 'string' },
                hints: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            media: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['image', 'video', 'audio', 'document'] },
                  url: { type: 'string', format: 'uri' },
                  caption: { type: 'string' }
                }
              }
            },
            location: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' }
                  }
                }
              }
            },
            stats: {
              type: 'object',
              properties: {
                views: { type: 'number' },
                likes: { type: 'number' },
                comments: { type: 'number' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Notification ID'
            },
            recipient: {
              type: 'string',
              description: 'Recipient user ID'
            },
            type: {
              type: 'string',
              enum: ['friend_request', 'friend_accepted', 'capsule_unlocked', 'capsule_shared', 'system'],
              description: 'Notification type'
            },
            title: {
              type: 'string',
              description: 'Notification title'
            },
            message: {
              type: 'string',
              description: 'Notification message'
            },
            data: {
              type: 'object',
              description: 'Additional notification data'
            },
            isRead: {
              type: 'boolean',
              description: 'Whether notification has been read'
            },
            readAt: {
              type: 'string',
              format: 'date-time',
              description: 'When notification was read'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
