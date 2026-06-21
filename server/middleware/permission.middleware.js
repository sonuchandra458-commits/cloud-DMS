const { query } = require('../config/db');

const checkDocumentAccess = (requiredPermission = 'read') => {
  return async (req, res, next) => {
    try {
      const documentId = req.params.id || req.params.docId;

      if (!documentId) return next();

      const docResult = await query(
        'SELECT * FROM documents WHERE id = $1 AND is_deleted = false',
        [documentId]
      );

      if (!docResult.rows[0]) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      const doc = docResult.rows[0];

      // Owner has all permissions
      if (doc.owner_id === req.user.id) {
        req.document = doc;
        return next();
      }

      // Admin has all permissions
      if (req.user.role === 'admin') {
        req.document = doc;
        return next();
      }

      // Check specific permission
      const permResult = await query(
        'SELECT * FROM permissions WHERE document_id = $1 AND user_id = $2',
        [documentId, req.user.id]
      );

      const permission = permResult.rows[0];

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this document',
        });
      }

      const permissionLevels = {
        read:  1,
        write: 2,
        admin: 3,
      };

      const userLevel     = permissionLevels[permission.permission] || 0;
      const requiredLevel = permissionLevels[requiredPermission]    || 1;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          message: `You need ${requiredPermission} permission for this action`,
        });
      }

      req.document   = doc;
      req.permission = permission.permission;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { checkDocumentAccess };