import request from "supertest";
import app from "../../index";
import { uploadImage } from "../../utils/upload";
import { jest } from '@jest/globals';

// Mock upload utility
jest.mock("../../utils/upload", () => ({
  uploadImage: jest.fn(),
}));

// Mock JWT verification
jest.mock("../../utils/jwt", () => ({
  verifyAccessToken: jest.fn().mockReturnValue({
    userId: "user-123",
    permissions: [],
  }),
}));

describe("Upload API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should upload image successfully", async () => {
    (uploadImage as jest.Mock<any>).mockResolvedValue({
      url: "https://cloudinary.com/image.jpg",
      public_id: "image_123",
    });

    // Create a dummy buffer
    const buffer = Buffer.from("fake-image-content");

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", "Bearer token")
      .attach("image", buffer, "test.jpg");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe("https://cloudinary.com/image.jpg");
    expect(uploadImage).toHaveBeenCalled();
  });

  it("should fail if no image provided", async () => {
    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", "Bearer token");
      // No attachment

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("No image file provided");
  });
});
