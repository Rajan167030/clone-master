export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error?.statusCode || 500;

  return res.status(statusCode).json({
    message: error?.message || "Internal server error.",
  });
};
