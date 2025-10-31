// src/app/api/errors/index.ts

/**
 * =============================================================================
 * Custom Error Classes
 * =============================================================================
 * Custom error classes for better error handling in the application
 * =============================================================================
 */

/**
 * Base class for custom errors
 */
export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Client sent invalid data
 */
export class BadRequestError extends CustomError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Client doesn't have permission
 */
export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends CustomError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

/**
 * 409 Conflict - Resource already exists
 */
export class ConflictError extends CustomError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends CustomError {
  errors?: any[];

  constructor(message: string = 'Validation Error', errors?: any[]) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * 500 Internal Server Error - Server error
 */
export class InternalServerError extends CustomError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500);
  }
}

/**
 * 503 Service Unavailable - External service unavailable
 */
export class ServiceUnavailableError extends CustomError {
  constructor(message: string = 'Service Unavailable') {
    super(message, 503);
  }
}
