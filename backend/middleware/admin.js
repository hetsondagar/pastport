/**
 * Admin authorization middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requireAdmin = (req, res, next) => {
  // Check if user is authenticated (should be called after protect middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * Admin or owner authorization middleware
 * Allows access if user is admin OR if user is the owner of the resource
 * @param {string} resourceIdParam - Name of the parameter containing the resource ID
 * @param {string} userIdField - Field name in the resource that contains the user ID
 * @returns {Function} Express middleware function
 */
export const requireAdminOrOwner = (resourceIdParam = 'id', userIdField = 'creator') => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Allow admin access
      if (req.user.role === 'admin') {
        return next();
      }

      // For non-admin users, check if they own the resource
      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        });
      }

      // Import the appropriate model based on the route
      let Model;
      const route = req.route.path;
      
      if (route.includes('/capsules')) {
        const { default: Capsule } = await import('../models/Capsule.js');
        Model = Capsule;
      } else if (route.includes('/users')) {
        const { default: User } = await import('../models/User.js');
        Model = User;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid resource type'
        });
      }

      // Check if user owns the resource
      const resource = await Model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check ownership
      const ownerId = resource[userIdField] || resource.creator;
      if (ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
