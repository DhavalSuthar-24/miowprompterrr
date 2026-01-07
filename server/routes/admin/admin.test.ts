import request from "supertest";
import app from "../../index";
import { prismaMock } from "../../tests/setup";

// Mock JWT verification
jest.mock("../../utils/jwt", () => ({
  verifyAccessToken: jest.fn().mockReturnValue({
    userId: "admin-user",
    permissions: [],
  }),
}));

describe("Admin Content API - Personalities", () => {
  beforeEach(() => {
    // Default mock for admin check
    prismaMock.userRole.findFirst.mockResolvedValue({
      role: { name: "ADMIN" },
    } as any);
  });

  describe("GET /api/admin/content/personalities", () => {
    it("should list personalities for admin", async () => {
      prismaMock.personality.findMany.mockResolvedValue([
        {
          id: "pers-1",
          name: "Personality 1",
          slug: "personality-1",
          isActive: true,
          _count: { prompts: 5 },
        },
      ] as any);

      const res = await request(app)
        .get("/api/admin/content/personalities")
        .set("Authorization", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Personality 1");
    });

    it("should deny access if not admin", async () => {
      prismaMock.userRole.findFirst.mockResolvedValue(null); // Not admin

      const res = await request(app)
        .get("/api/admin/content/personalities")
        .set("Authorization", "Bearer token");

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/admin/content/personalities", () => {
    const newPersonality = {
      name: "New Personality",
      description: "Description",
      icon: "🤖",
    };

    it("should create personality", async () => {
        // Mock unique check
        prismaMock.personality.findUnique.mockResolvedValue(null);
        
        // Mock aggregate
        prismaMock.personality.aggregate.mockResolvedValue({ _max: { sortOrder: 0 } } as any);

        // Mock create
        prismaMock.personality.create.mockResolvedValue({
            id: "new-pers",
            name: newPersonality.name,
            slug: "new-personality",
            createdById: "admin-user"
        } as any);

        const res = await request(app)
            .post("/api/admin/content/personalities")
            .set("Authorization", "Bearer token")
            .send(newPersonality);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(newPersonality.name);
    });

    it("should fail validation if name is missing", async () => {
        const invalid = { description: "Desc" };
        const res = await request(app)
            .post("/api/admin/content/personalities")
            .set("Authorization", "Bearer token")
            .send(invalid);
        
        expect(res.status).toBe(400);
    });
  });
});
