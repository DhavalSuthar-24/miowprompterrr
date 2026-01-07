import { Request } from "express";

/**
 * Extended Express Request interface with user information
 * Used for authenticated routes
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
    role?: string;
  };
}

/**
 * Standard pagination query parameters
 */
export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

/**
 * Typed request body
 */
export interface TypedRequestBody<T> extends Request {
  body: T;
}

/**
 * Typed request query
 */
export interface TypedRequestQuery<T> extends Request {
  query: T & import("express-serve-static-core").Query;
}
