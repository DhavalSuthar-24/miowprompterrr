import request from "supertest";
import app from "../index";
import { prismaMock } from "../tests/setup";
import bcrypt from "bcryptjs";

// Mock bcrypt to avoid hashing in tests
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
}));

describe("Auth API", () => {
  describe("POST /auth/register", () => {
    const newUser = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    it("should register a new user successfully", async () => {
      // Mock finding existing user (null)
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Mock creating user
      prismaMock.user.create.mockResolvedValue({
        id: "user-123",
        username: newUser.username,
        email: newUser.email,
        password: "hashed_password",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [
          {
            role: {
              name: "USER",
              permissions: [],
            },
          },
        ],
      } as any);

      // Mock default role
      prismaMock.role.findUnique.mockResolvedValue({
        id: "role-user",
        name: "USER",
      } as any);

      const res = await request(app).post("/auth/register").send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(newUser.email);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it("should return 409 if email already exists", async () => {
      // Mock finding existing user
      prismaMock.user.findUnique.mockResolvedValue({
        id: "existing-user",
        email: newUser.email,
      } as any);

      const res = await request(app).post("/auth/register").send(newUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already exists");
    });
  });

  describe("POST /auth/login", () => {
    const loginData = {
      email: "test@example.com",
      password: "Password123!",
    };

    it("should login successfully with correct credentials", async () => {
      // Mock finding user
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-123",
        username: "testuser",
        email: loginData.email,
        password: "hashed_password",
        roles: [
          {
            role: {
              name: "USER",
              permissions: [],
              rolePermissions: [],
            },
          },
        ],
      } as any);

      // Mock permissions
      prismaMock.permission.findMany.mockResolvedValue([]);

      // Mock bcrypt compare
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await request(app).post("/auth/login").send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it("should return 401 with incorrect password", async () => {
      // Mock finding user
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-123",
        password: "hashed_password",
        roles: [],
      } as any);

      // Mock bcrypt compare to false
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app).post("/auth/login").send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
