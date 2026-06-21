module.exports = {
  ROLES: {
    OWNER:     'owner',
    ADMIN:     'admin',
    EDITOR:    'editor',
    COMMENTER: 'commenter',
    VIEWER:    'viewer',
  },
  PERMISSIONS: {
    READ:    'read',
    WRITE:   'write',
    DELETE:  'delete',
    SHARE:   'share',
    ADMIN:   'admin',
  },
  ACTIONS: {
    UPLOAD:   'upload',
    DOWNLOAD: 'download',
    VIEW:     'view',
    EDIT:     'edit',
    DELETE:   'delete',
    SHARE:    'share',
    RESTORE:  'restore',
    LOGIN:    'login',
    LOGOUT:   'logout',
  },
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'text/plain', 'text/csv',
    'application/zip',
  ],
};