// Handle 404 errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error handler
const errorHandler = (err, req, res, next) => {
  // Sometimes the status code is 200 even when there's an error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error for debugging
  console.error(`Error (${statusCode}): ${err.message}`);
  
  // In development, log the full stack trace
  if (process.env.NODE_ENV === 'development') {
    console.error('Error stack:', err.stack);
    
    // Log additional context that might help debugging
    console.error('Request path:', req.originalUrl);
    console.error('Request method:', req.method);
    console.error('Request IP:', req.ip);
    
    // For auth errors, log authentication context (but not tokens)
    if (statusCode === 401 || statusCode === 403) {
      console.error('Auth present:', req.headers.authorization ? 'Yes' : 'No');
      console.error('User in request:', req.user ? req.user._id : 'None');
    }
  }
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    // Add a request ID for tracking the error in logs
    requestId: req.id || Math.random().toString(36).substring(2, 15)
  });
};

export { notFound, errorHandler }; 