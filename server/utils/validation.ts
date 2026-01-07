/**
 * Check if a string meets minimum length requirement
 */
export function validateMinLength(value: string | undefined, min: number, fieldName: string): string | null {
  if (!value || value.length < min) {
    return `${fieldName} must be at least ${min} characters long`;
  }
  return null;
}

/**
 * Check if a string does not exceed maximum length requirement
 */
export function validateMaxLength(value: string | undefined, max: number, fieldName: string): string | null {
  if (value && value.length > max) {
    return `${fieldName} must be at most ${max} characters long`;
  }
  return null;
}

/**
 * Check if a value is provided
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return `${fieldName} is required`;
  }
  if (typeof value === "string" && value.trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Check if a value is one of the allowed enum values
 */
export function validateEnum<T extends string | number>(
  value: any, 
  validValues: readonly T[] | T[], 
  fieldName: string
): string | null {
  if (!validValues.includes(value)) {
    return `${fieldName} must be one of: ${validValues.join(", ")}`;
  }
  return null;
}

/**
 * Check if a string is a valid email format
 */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
}

/**
 * Run multiple validation checks and return the first error found
 */
export function runValidation(...checks: (string | null)[]): string | null {
  for (const check of checks) {
    if (check) return check;
  }
  return null;
}
