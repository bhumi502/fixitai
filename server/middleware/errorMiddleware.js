// middleware/errorMiddleware.js - Centralized error handling
const notFound = (req, res, next) => {
  const error = new Error(`API endpoint not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle Multer upload errors
  let message = err.message || 'Internal Server Error';
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File is too large. Maximum allowed size is 5MB.';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
