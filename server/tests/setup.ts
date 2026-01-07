// Global setup for Jest tests
import { PrismaClient } from "../../src/generated/prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { prisma } from "../db";

// Mock Prisma
jest.mock("../db", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

function mockReset(mock: DeepMockProxy<any>) {
  Object.keys(mock).forEach((key) => {
    if (typeof mock[key] === "object" && mock[key] !== null && "mockReset" in mock[key]) {
      mock[key].mockReset();
    }
  });
}
