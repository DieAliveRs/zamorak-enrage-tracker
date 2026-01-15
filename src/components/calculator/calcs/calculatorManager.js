// src/components/calculator/calcs/calculatorManager.js

import { calculatorState } from '../state/calculatorState.js';
import { eventBus, EVENTS } from '../state/eventBus.js';
import { calculateAll } from './calculations.js';

class CalculatorManager {
  constructor() {
    this.isCalculating = false;
    this.calculationCache = new Map();
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!eventBus) return;

    eventBus.on(EVENTS.STATE_CHANGED, this.handleStateChange.bind(this));
    eventBus.on(EVENTS.CALCULATION_REQUESTED, this.performCalculations.bind(this));
    eventBus.on(EVENTS.SETTINGS_LOADED, this.handleSettingsLoaded.bind(this));

    document.addEventListener('calc-input-change', this.handleInputChange.bind(this));
    document.addEventListener('calc-select-change', this.handleSelectChange.bind(this));
    document.addEventListener('calc-checkbox-change', this.handleCheckboxChange.bind(this));
    }


  handleStateChange(data) {
    // Debounce calculations to prevent excessive computation
    clearTimeout(this.calculationTimer);
    this.calculationTimer = setTimeout(() => {
      this.performCalculations();
    }, 50);
  }

  handleInputChange(event) {
    const { name, value, type } = event.detail;
    let processedValue = value;
    
    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
      
      // Apply bounds for specific fields
      switch (name) {
        case 'enrage':
          processedValue = Math.min(Math.max(processedValue, 0), 4000);
          break;
        case 'def':
          processedValue = Math.min(Math.max(processedValue, 1), 99);
          break;
        case 'maxhp':
        case 'currenthp':
          processedValue = Math.max(processedValue, 1);
          break;
      }
    }
    
    calculatorState.set(name, processedValue);
  }

  handleSelectChange(event) {
    const { name, value } = event.detail;
    calculatorState.set(name, value);
  }

  handleCheckboxChange(event) {
    const { name, checked } = event.detail;
    calculatorState.set(name, checked);
  }

  handleSettingsLoaded(settings) {
    // Update calculations when settings are loaded
    this.performCalculations();
  }

  async performCalculations() {
    if (this.isCalculating) return;
    
    this.isCalculating = true;
    
    try {
      const state = calculatorState.getAll();
      
      // Calculate everything
      const results = calculateAll(state);
      
      // Store in cache
      const cacheKey = JSON.stringify(state);
      this.calculationCache.set(cacheKey, results);
      
      // Emit results
      document.dispatchEvent(
        new CustomEvent('calculator-results-updated', {
            detail: results
        })
        );

      
    } catch (error) {
      console.error('Calculation error:', error);
      eventBus.emit(EVENTS.ERROR_OCCURRED, {
        action: 'calculation',
        error: error.message
      });
    } finally {
      this.isCalculating = false;
    }
  }

  getCachedCalculation(state) {
    const cacheKey = JSON.stringify(state);
    return this.calculationCache.get(cacheKey);
  }
}

// Create singleton instance
export const calculatorManager = new CalculatorManager();