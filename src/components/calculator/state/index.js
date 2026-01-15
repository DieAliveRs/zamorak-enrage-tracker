// src/components/calculator/state/index.js

// Central export for all state management
export { calculatorState, useCalculatorState } from './calculatorState.js';
export { CalculatorStorage, DEFAULT_STATE } from './storage.js';
export { eventBus, EVENTS } from './eventBus.js';

// Convenience function to initialize calculator
export function initializeCalculator() {
  console.log('🧮 Zamorak Calculator initialized');
  
  // Log storage status
  const stats = calculatorState.getStorageStats();
  console.log('💾 Storage status:', stats);
  
  return calculatorState;
}