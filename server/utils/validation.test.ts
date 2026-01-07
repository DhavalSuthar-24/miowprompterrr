import {
  validateMinLength,
  validateMaxLength,
  validateRequired,
  validateEnum,
  validateEmail,
} from "./validation";

describe("Validation Utils", () => {
  describe("validateRequired", () => {
    it("should return error if value is undefined or null", () => {
      expect(validateRequired(undefined, "Field")).toBe("Field is required");
      expect(validateRequired(null, "Field")).toBe("Field is required");
    });

    it("should return error if string is empty", () => {
      expect(validateRequired("", "Field")).toBe("Field is required");
      expect(validateRequired("   ", "Field")).toBe("Field is required");
    });

    it("should return null if value is present", () => {
      expect(validateRequired("value", "Field")).toBeNull();
      expect(validateRequired(0, "Field")).toBeNull();
    });
  });

  describe("validateMinLength", () => {
    it("should return error if string is too short", () => {
      expect(validateMinLength("abc", 5, "Field")).toBe("Field must be at least 5 characters long");
    });

    it("should return null if string length is adequate", () => {
      expect(validateMinLength("abcde", 5, "Field")).toBeNull();
    });
  });

  describe("validateMaxLength", () => {
    it("should return error if string is too long", () => {
      expect(validateMaxLength("abcdef", 5, "Field")).toBe("Field must be at most 5 characters long");
    });

    it("should return null if string length is within limit", () => {
      expect(validateMaxLength("abc", 5, "Field")).toBeNull();
    });
  });

  describe("validateEnum", () => {
    const validValues = ["A", "B", "C"];

    it("should return error if value is not in enum", () => {
      expect(validateEnum("D", validValues, "Field")).toBe("Field must be one of: A, B, C");
    });

    it("should return null if value is valid", () => {
      expect(validateEnum("A", validValues, "Field")).toBeNull();
    });
  });

  describe("validateEmail", () => {
    it("should return error for invalid emails", () => {
      expect(validateEmail("invalid")).toBe("Invalid email format");
      expect(validateEmail("test@")).toBe("Invalid email format");
    });

    it("should return null for valid emails", () => {
      expect(validateEmail("test@example.com")).toBeNull();
    });
  });
});
