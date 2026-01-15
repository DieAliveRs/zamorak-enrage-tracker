// src/components/calculator/state/eventBus.js

// Simple event bus for cross-component communication
class EventBus {
  constructor() {
    this.listeners = new Map();
    this.debounceTimers = new Map();
  }
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }
  
  /**
   * Emit an event
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }
  
  /**
   * Emit an event with debouncing
   */
  emitDebounced(event, data, delay = 100) {
    if (this.debounceTimers.has(event)) {
      clearTimeout(this.debounceTimers.get(event));
    }
    
    const timer = setTimeout(() => {
      this.emit(event, data);
      this.debounceTimers.delete(event);
    }, delay);
    
    this.debounceTimers.set(event, timer);
  }
  
  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Event names
export const EVENTS = {
  STATE_CHANGED: 'state:changed',
  SETTING_CHANGED: 'setting:changed',
  CALCULATION_REQUESTED: 'calculation:requested',
  CALCULATION_COMPLETED: 'calculation:completed',
  ERROR_OCCURRED: 'error:occurred',
  SETTINGS_LOADED: 'settings:loaded',
  SETTINGS_SAVED: 'settings:saved',
  SETTINGS_CLEARED: 'settings:cleared',
  UI_THEME_CHANGED: 'ui:theme:changed'
};