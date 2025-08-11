// Standardized response handler
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    ...(data && { data }),
    ...(meta && { meta })
  };

  return res.status(statusCode).json(response);
};

// Success responses
const sendSuccess = (res, message, data = null, meta = null) => {
  return sendResponse(res, 200, true, message, data, meta);
};

const sendCreated = (res, message, data = null) => {
  return sendResponse(res, 201, true, message, data);
};

// Error responses
const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };

  return res.status(statusCode).json(response);
};

const sendBadRequest = (res, message, errors = null) => {
  return sendError(res, 400, message, errors);
};

const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, 401, message);
};

const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(res, 403, message);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};

const sendServerError = (res, message = 'Internal server error') => {
  return sendError(res, 500, message);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendServerError
};