const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Server Error';

  if (err.code === '23505') {
    message    = 'Record already exists';
    statusCode = 400;
  }
  if (err.code === '23503') {
    message    = 'Referenced record not found';
    statusCode = 404;
  }
  if (err.name === 'JsonWebTokenError') {
    message    = 'Invalid token';
    statusCode = 401;
  }

  console.error(`❌ Error: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;