// src/components/calculator/utils/mathHelpers.js

/**
 * Python-style floor function
 */
export function pfloor(value) {
  return Math.floor(value);
}

/**
 * Python-style min function
 */
export function pmin(...values) {
  return Math.min(...values);
}

/**
 * Python-style max function
 */
export function pmax(...values) {
  return Math.max(...values);
}

/**
 * Round to specific decimal places
 */
export function pround(value, decimals = 0) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate percentage
 */
export function percentage(part, total) {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Linear interpolation
 */
export function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate average
 */
export function average(...values) {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

/**
 * Calculate sum
 */
export function sum(...values) {
  return values.reduce((a, b) => a + b, 0);
}

/**
 * Calculate product
 */
export function product(...values) {
  return values.reduce((a, b) => a * b, 1);
}

/**
 * Safe division (returns 0 if denominator is 0)
 */
export function safeDivide(numerator, denominator) {
  if (denominator === 0) return 0;
  return numerator / denominator;
}