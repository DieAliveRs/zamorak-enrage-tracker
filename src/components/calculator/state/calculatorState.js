// src/components/calculator/state/calculatorState.js

import { CalculatorStorage, DEFAULT_STATE } from './storage.js';
import { eventBus, EVENTS } from './eventBus.js';

// Debounce calculation to prevent excessive recomputation
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

class CalculatorState {
  constructor() {
    // Load from cache or use defaults
    this.state = CalculatorStorage.load();
    this.listeners = new Set();
    
    // Track which fields have been modified
    this.modifiedFields = new Set();
    
    // Auto-save timer
    this.autoSaveTimer = null;
    this.autoSaveDelay = 500; // 0.5 seconds
    
    // Bind methods
    this.set = this.set.bind(this);
    this.batchUpdate = this.batchUpdate.bind(this);
    
    // Notify that settings have been loaded
    setTimeout(() => {
      eventBus.emit(EVENTS.SETTINGS_LOADED, this.state);
    }, 0);
  }
  
  /**
   * Get a single value
   */
  get(key) {
    return this.state[key];
  }
  
  /**
   * Get all state (clone to prevent mutation)
   */
  getAll() {
    return { ...this.state };
  }
  
  /**
   * Set a single value
   */
  set(key, value) {
    const oldValue = this.state[key];
    
    // Only update if value changed
    if (oldValue !== value) {
      this.state[key] = value;
      this.modifiedFields.add(key);
      
      // Special handling for dependent fields
      this.handleDependencies(key, value);
      
      // Notify listeners
      this.notifyListeners(key, value, oldValue);
      
      // Emit events
      eventBus.emit(EVENTS.SETTING_CHANGED, { key, value, oldValue });
    //   eventBus.emitDebounced(EVENTS.STATE_CHANGED, { key, value, oldValue }, 50);
      
      // Schedule auto-save
      this.scheduleAutoSave();
      
      // Request calculation (debounced)
      eventBus.emitDebounced(EVENTS.CALCULATION_REQUESTED, this.state, 150);
    }
  }
  
  /**
   * Update multiple values at once
   */
  batchUpdate(updates) {
    const changes = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      const oldValue = this.state[key];
      if (oldValue !== value) {
        this.state[key] = value;
        this.modifiedFields.add(key);
        changes.push({ key, value, oldValue });
        
        // Special handling for dependent fields
        this.handleDependencies(key, value);
      }
    });
    
    if (changes.length > 0) {
      // Notify for each change
      changes.forEach(({ key, value, oldValue }) => {
        this.notifyListeners(key, value, oldValue);
        eventBus.emit(EVENTS.SETTING_CHANGED, { key, value, oldValue });
      });
      
      // Emit batch change
      eventBus.emit(EVENTS.STATE_CHANGED, { batch: true, changes });
      eventBus.emitDebounced(EVENTS.CALCULATION_REQUESTED, this.state, 150);
      
      // Schedule auto-save
      this.scheduleAutoSave();
    }
  }
  
  /**
   * Handle field dependencies (e.g., divert_res_check -> divert)
   */
  handleDependencies(key, value) {
    // Update divert based on divert_res_check
    if (key === 'divert_res_check') {
      console.log('mode:', this.state.divert_res_check);
      const divertValue = (value === "Divert" || value === "Resonance");
      const oldDivert = this.state.divert;

      this.state.divert = divertValue;
      this.modifiedFields.add('divert');

      // Always notify, even if the boolean didn't change
      this.notifyListeners('divert', divertValue, oldDivert);
    }
    
    // Add more dependencies as needed
  }
  
  /**
   * Reset to defaults
   */
  reset() {
    const oldState = this.state;
    this.state = { ...DEFAULT_STATE };
    this.modifiedFields.clear();
    
    // Notify for all changes
    Object.keys(this.state).forEach(key => {
      if (oldState[key] !== this.state[key]) {
        this.notifyListeners(key, this.state[key], oldState[key]);
      }
    });
    
    eventBus.emit(EVENTS.STATE_CHANGED, { reset: true, state: this.state });
    eventBus.emit(EVENTS.CALCULATION_REQUESTED, this.state);
    
    // Save immediately
    this.saveToCache();
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Subscribe to specific key changes
   */
  subscribeTo(key, listener) {
    const wrappedListener = (changedKey, newValue, oldValue) => {
      if (changedKey === key || key === '*') {
        listener(newValue, oldValue, changedKey);
      }
    };
    
    return this.subscribe(wrappedListener);
  }
  
  /**
   * Notify all listeners
   */
  notifyListeners(key, value, oldValue) {
    this.listeners.forEach(listener => {
      try {
        listener(key, value, oldValue);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }
  
  /**
   * Schedule auto-save to cache
   */
  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.saveToCache();
    }, this.autoSaveDelay);
  }
  
  /**
   * Save to cache immediately
   */
  saveToCache() {
    const success = CalculatorStorage.save(this.state);
    if (success && this.modifiedFields.size > 0) {
      eventBus.emit(EVENTS.SETTINGS_SAVED, {
        state: this.state,
        modifiedFields: Array.from(this.modifiedFields)
      });
      this.modifiedFields.clear();
    }
  }
  
  /**
   * Export settings
   */
  exportSettings() {
    return CalculatorStorage.exportSettings(this.state);
  }
  
  /**
   * Import settings
   */
  async importSettings(file) {
    try {
      const newState = await CalculatorStorage.importSettings(file);
      const oldState = this.state;
        this.state = newState;

        Object.keys(newState).forEach(key => {
        this.notifyListeners(key, newState[key], oldState[key]);
        });

      
      eventBus.emit(EVENTS.SETTINGS_LOADED, newState);
      eventBus.emit(EVENTS.CALCULATION_REQUESTED, newState);
      eventBus.emit(EVENTS.STATE_CHANGED, { imported: true, state: newState });
      
      return true;
    } catch (error) {
      eventBus.emit(EVENTS.ERROR_OCCURRED, { 
        action: 'import', 
        error: error.message 
      });
      return false;
    }
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    const success = CalculatorStorage.clear();
    if (success) {
      eventBus.emit(EVENTS.SETTINGS_CLEARED);
    }
    return success;
  }
  
  /**
   * Get storage statistics
   */
  getStorageStats() {
    return CalculatorStorage.getStats();
  }
  
  /**
   * Destroy instance and clean up
   */
  destroy() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.listeners.clear();
    this.modifiedFields.clear();
  }
}

// Create singleton instance
const calculatorState = new CalculatorState();

// Export singleton and class
export { CalculatorState, calculatorState };

// Helper function for components to use
export function useCalculatorState() {
  return calculatorState;
}