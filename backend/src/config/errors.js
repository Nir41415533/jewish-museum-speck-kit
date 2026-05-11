class AppError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function notFound(resource) {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
}

function badRequest(message) {
  return new AppError(message, 400, 'BAD_REQUEST');
}

module.exports = { AppError, notFound, badRequest };
