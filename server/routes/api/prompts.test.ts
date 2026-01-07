import request from "supertest";
import app from "../../index";
import { prismaMock } from "../../tests/setup";

// Mock JWT verification to simulate authenticated user
jest.mock("../../utils/jwt", () => ({
  verifyAccessToken: jest.fn().mockReturnValue({
    userId: "user-123",
    permissions: [],
  }),
}));

// Mock authentication middleware if needed, but mocking verifyAccessToken is usually enough 
// if the middleware uses it directly.

describe("Prompts API", () => {
  describe("GET /api/prompts", () => {
    it("should list prompts", async () => {
      // Mock findMany
      prismaMock.prompt.findMany.mockResolvedValue([
        {
          id: "prompt-1",
          title: "Test Prompt",
          content: "This is a test prompt content.",
          upvotes: 0,
          downvotes: 0,
          score: 0,
          viewCount: 0,
          copyCount: 0,
          isFeatured: false,
          createdAt: new Date(),
          author: {
            id: "user-1",
            username: "author",
            image: "avatar.png",
          },
          personality: null,
          presetMode: null,
          tags: [],
          _count: { comments: 0 },
        },
      ] as any);

      // Mock count
      prismaMock.prompt.count.mockResolvedValue(1);

      const res = await request(app).get("/api/prompts");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Test Prompt");
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe("POST /api/prompts", () => {
    const newPrompt = {
      title: "New Prompt",
      content: "This is the content for the new prompt.",
      status: "PUBLISHED",
    };

    it("should create a new prompt", async () => {
      // Mock create
      prismaMock.prompt.create.mockResolvedValue({
        id: "prompt-new",
        title: newPrompt.title,
        content: newPrompt.content,
        authorId: "user-123",
        status: "PUBLISHED",
        author: {
            id: "user-123",
            username: "testuser",
            image: null
        }
      } as any);
      
      // Mock upsert userStats
      prismaMock.userStats.upsert.mockResolvedValue({} as any);

      // Send request with mocked auth header (value doesn't matter if verified mocked)
      const res = await request(app)
        .post("/api/prompts")
        .set("Authorization", "Bearer mock-token")
        .send(newPrompt);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(newPrompt.title);
    });

    it("should fail validation for short content", async () => {
        const shortPrompt = {
            title: "Title",
            content: "Short",
        };

        const res = await request(app)
            .post("/api/prompts")
            .set("Authorization", "Bearer mock-token")
            .send(shortPrompt);

        expect(res.status).toBe(422); // Validation error
    });
  });

  describe("GET /api/prompts/:id", () => {
      it("should return prompt details", async () => {
        prismaMock.prompt.findUnique.mockResolvedValue({
            id: "prompt-1",
            title: "Detailed Prompt",
            content: "Content...",
            status: "PUBLISHED",
            authorId: "user-other",
            upvotes: 0,
            downvotes: 0,
            score: 0,
            viewCount: 10,
            copyCount: 0,
            isFeatured: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            author: { id: "user-other" },
            tags: [],
            _count: { comments: 0, savedBy: 0 }
        } as any);

        // Mock vote/saved check
        prismaMock.vote.findFirst.mockResolvedValue(null);
        prismaMock.savedPrompt.findFirst.mockResolvedValue(null);
        
        // Mock update (view count)
        prismaMock.prompt.update.mockResolvedValue({} as any);

        const res = await request(app).get("/api/prompts/prompt-1");

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Detailed Prompt");
      });

      it("should return 404 if not found", async () => {
          prismaMock.prompt.findUnique.mockResolvedValue(null);

          const res = await request(app).get("/api/prompts/unknown");

          expect(res.status).toBe(404);
      });
  });
});
