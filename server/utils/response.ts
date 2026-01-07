import { Response } from "express";

/**
 * Standard API response structure
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Send a success response
 */
export function sendSuccess<T>(
  res: Response, 
  data: T, 
  message?: string, 
  statusCode = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  error: unknown,
  message = "An error occurred",
  statusCode = 500
) {
  console.error(`[Error] ${message}:`, error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const response: ApiResponse = {
    success: false,
    error: errorMessage,
    message,
  };
  return res.status(statusCode).json(response);
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    pagination: {
      ...pagination,
      totalPages,
    },
  };
  return res.json(response);
}

/**
 * Send a generic client error (400)
 */
export function sendBadRequest(res: Response, message: string) {
  return sendError(res, new Error(message), message, 400);
}

/**
 * Send a validation error (422)
 */
export function sendValidationError(res: Response, message: string) {
  return sendError(res, new Error(message), message, 422);
}

/**
 * Send a not found error (404)
 */
export function sendNotFound(res: Response, entity: string) {
  const message = `${entity} not found`;
  return sendError(res, new Error(message), message, 404);
}

/**
 * Send a forbidden error (403)
 */
export function sendForbidden(res: Response, message = "Access denied") {
  return sendError(res, new Error(message), message, 403);
}

/**
 * Send an unauthorized error (401)
 */
export function sendUnauthorized(res: Response, message = "Authentication required") {
  return sendError(res, new Error(message), message, 401);
}
