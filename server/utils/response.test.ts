import { Response } from "express";
import {
  sendSuccess,
  sendError,
  sendPaginated,
  sendNotFound,
  sendForbidden,
  sendValidationError,
} from "./response";

describe("Response Utils", () => {
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnThis();
    mockRes = {
      json: jsonMock,
      status: statusMock,
    } as unknown as Partial<Response>;
  });

  describe("sendSuccess", () => {
    it("should send a 200 success response with data", () => {
      const data = { foo: "bar" };
      sendSuccess(mockRes as Response, data);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it("should send a custom status code", () => {
      sendSuccess(mockRes as Response, { created: true }, "Created", 201);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { created: true },
        message: "Created",
      });
    });
  });

  describe("sendError", () => {
    it("should send a 500 error response by default", () => {
      const error = new Error("Something went wrong");
      sendError(mockRes as Response, error, "Internal Failure");
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Something went wrong",
        message: "Internal Failure",
      });
    });

    it("should send a custom error status", () => {
      sendError(mockRes as Response, null, "Bad Input", 400);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "null",
        message: "Bad Input",
      });
    });
  });

  describe("sendPaginated", () => {
    it("should send a paginated response", () => {
      const data = [1, 2, 3];
      const pagination = { page: 1, limit: 10, total: 3 };
      sendPaginated(mockRes as Response, data, pagination);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
        },
      });
    });
  });

  describe("Helper Status Functions", () => {
    it("sendNotFound should send 404", () => {
      sendNotFound(mockRes as Response, "User");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "User not found",
        message: "User not found",
      });
    });

    it("sendForbidden should send 403", () => {
      sendForbidden(mockRes as Response, "Access denied");
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Access denied",
        message: "Access denied",
      });
    });

    it("sendValidationError should send 422", () => {
      sendValidationError(mockRes as Response, "Invalid email");
      expect(statusMock).toHaveBeenCalledWith(422);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Invalid email",
        message: "Invalid email",
      });
    });
  });
});
