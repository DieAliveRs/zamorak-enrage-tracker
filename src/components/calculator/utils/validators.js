// src/components/calculator/utils/validators.js

/**
 * Validate number input
 */
export function validateNumber(value, options = {}) {
  const { min, max, integer = false, required = true } = options;
  
  // Check if required
  if (required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: 'Value is required' };
  }
  
  // Convert to number
  const num = Number(value);
  
  // Check if it's a valid number
  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }
  
  // Check if integer is required
  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: 'Must be an integer' };
  }
  
  // Check min value
  if (min !== undefined && num < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }
  
  // Check max value
  if (max !== undefined && num > max) {
    return { valid: false, error: `Must be at most ${max}` };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate enrage value (0-4000)
 */
export function validateEnrage(value) {
  return validateNumber(value, { min: 0, max: 4000, integer: true });
}

/**
 * Validate HP value (positive number)
 */
export function validateHP(value) {
  return validateNumber(value, { min: 1, integer: true });
}

/**
 * Validate percentage (0-100)
 */
export function validatePercent(value) {
  return validateNumber(value, { min: 0, max: 100, integer: false });
}

/**
 * Validate stack count (0-10)
 */
export function validateStacks(value) {
  return validateNumber(value, { min: 0, max: 10, integer: true });
}

/**
 * Validate gear selection
 */
export function validateGear(gearName, validOptions = []) {
  if (!gearName) {
    return { valid: false, error: 'Gear selection is required' };
  }
  
  if (validOptions.length > 0 && !validOptions.includes(gearName)) {
    return { valid: false, error: 'Invalid gear selection' };
  }
  
  return { valid: true, value: gearName };
}

/**
 * Validate dropdown selection
 */
export function validateSelection(value, validOptions = []) {
  if (!value && value !== 0 && value !== false) {
    return { valid: false, error: 'Selection is required' };
  }
  
  if (validOptions.length > 0 && !validOptions.includes(value)) {
    return { valid: false, error: 'Invalid selection' };
  }
  
  return { valid: true, value };
}