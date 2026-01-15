// src/components/calculator/utils/stateHelpers.js

import { calculatorState } from '../state/calculatorState.js';

/**
 * Initialize calculator state and bind UI events
 */
export function initializeCalculator() {
  console.log('🧮 Initializing calculator...');
  
  // Load initial state
  const initialState = calculatorState.getAll();
  
  // Set up event listeners for UI changes
  document.addEventListener('calc-input-change', handleInputChange);
  document.addEventListener('calc-select-change', handleSelectChange);
  document.addEventListener('calc-checkbox-change', handleCheckboxChange);
  
  // Subscribe to state changes for UI updates
  const unsubscribe = calculatorState.subscribe((key, newValue, oldValue) => {
    updateUIElement(key, newValue);
  });
  
  // Initial UI update
  updateAllUI(initialState);
  
  return {
    unsubscribe,
    getState: () => calculatorState.getAll(),
    updateSetting: (key, value) => calculatorState.set(key, value),
    reset: () => calculatorState.reset()
  };
}

/**
 * Handle input field changes
 */
function handleInputChange(event) {
  const { name, value, type } = event.detail;
  
  let processedValue = value;
  
  // Convert based on input type
  if (type === 'number') {
    processedValue = value === '' ? 0 : Number(value);
  }
  
  // Update state
  calculatorState.set(name, processedValue);
}

/**
 * Handle select menu changes
 */
function handleSelectChange(event) {
  const { name, value } = event.detail;
  calculatorState.set(name, value);
}

/**
 * Handle checkbox changes
 */
function handleCheckboxChange(event) {
  const { name, checked } = event.detail;
  calculatorState.set(name, checked);
}

/**
 * Update a specific UI element
 */
function updateUIElement(key, value) {
  // Find all elements with data attribute for this key
  const elements = document.querySelectorAll(`[data-calc-key="${key}"]`);
  
  elements.forEach(element => {
    const elementType = element.tagName.toLowerCase();
    
    switch (elementType) {
      case 'input':
        if (element.type === 'checkbox') {
          element.checked = Boolean(value);
        } else {
          element.value = value;
        }
        break;
        
      case 'select':
        element.value = value;
        break;
        
      case 'span':
      case 'div':
      case 'p':
        element.textContent = formatValueForDisplay(key, value);
        break;
        
      default:
        if (element.hasAttribute('data-calc-value')) {
          element.textContent = formatValueForDisplay(key, value);
        }
    }
  });
}

/**
 * Format value for display based on key
 */
function formatValueForDisplay(key, value) {
  // Import formatters
  import('./formatters.js').then(({ formatNumber, formatPercent }) => {
    // Number formatting based on key patterns
    if (typeof value === 'number') {
      if (key.includes('hp') || key.includes('Hp') || key.includes('HP')) {
        return formatNumber(value);
      } else if (key.includes('percent') || key.includes('Percent') || key.includes('_dr')) {
        return formatPercent(value);
      } else if (value >= 1000) {
        return formatNumber(value);
      }
    }
    
    return value.toString();
  }).catch(() => {
    // Fallback if formatters fail to load
    return value.toString();
  });
  
  return value.toString();
}

/**
 * Update all UI elements with current state
 */
function updateAllUI(state) {
  Object.entries(state).forEach(([key, value]) => {
    updateUIElement(key, value);
  });
}

/**
 * Get icon path for a given icon name
 */
export function getIconPath(iconName) {
  return `/images/calculator/icons/${iconName}.png`;
}

/**
 * Get gear options for dropdowns
 */
export function getGearOptions(gearType) {
  const gearOptions = {
    helm: [
      { value: "Other/Dps", label: "Other/DPS" },
      { value: "Cryptbloom", label: "Cryptbloom" },
      { value: "Achto (mage)", label: "Achto (Mage)" },
      { value: "Achto (non mage)", label: "Achto (Non-Mage)" },
      { value: "Deathwarden", label: "Deathwarden" },
      { value: "Sub. Ports", label: "Subjugation Ports" },
      { value: "Ganodermic", label: "Ganodermic" },
      { value: "TFN", label: "Teralith (T95)" },
      { value: "Deathdealer t90", label: "Deathdealer (T90)" }
    ],
    top: [
      { value: "Other/Dps", label: "Other/DPS" },
      { value: "Cryptbloom", label: "Cryptbloom" },
      { value: "Achto (mage)", label: "Achto (Mage)" },
      { value: "Achto (non mage)", label: "Achto (Non-Mage)" },
      { value: "Deathwarden", label: "Deathwarden" },
      { value: "Sub. Ports", label: "Subjugation Ports" },
      { value: "Ganodermic", label: "Ganodermic" },
      { value: "TFN", label: "Teralith (T95)" },
      { value: "Deathdealer t90", label: "Deathdealer (T90)" }
    ],
    bottoms: [
      { value: "Other/Dps", label: "Other/DPS" },
      { value: "Deathtouch bracelet", label: "Deathtouch Bracelet" },
      { value: "Cryptbloom", label: "Cryptbloom" },
      { value: "Achto (mage)", label: "Achto (Mage)" },
      { value: "Achto (non mage)", label: "Achto (Non-Mage)" },
      { value: "Deathwarden", label: "Deathwarden" },
      { value: "Sub. Ports", label: "Subjugation Ports" },
      { value: "Ganodermic", label: "Ganodermic" },
      { value: "TFN", label: "Teralith (T95)" },
      { value: "Deathdealer t90", label: "Deathdealer (T90)" }
    ],
    gloves: [
      { value: "Other/Dps", label: "Other/DPS" },
      { value: "Deathtouch bracelet", label: "Deathtouch Bracelet" },
      { value: "Cryptbloom", label: "Cryptbloom" },
      { value: "Achto (mage)", label: "Achto (Mage)" },
      { value: "Achto (non mage)", label: "Achto (Non-Mage)" },
      { value: "Deathwarden", label: "Deathwarden" },
      { value: "Sub. Ports", label: "Subjugation Ports" },
      { value: "Ganodermic", label: "Ganodermic" },
      { value: "TFN", label: "Teralith (T95)" },
      { value: "Deathdealer t90", label: "Deathdealer (T90)" }
    ],
    boots: [
      { value: "Other/Dps", label: "Other/DPS" },
      { value: "Cryptbloom", label: "Cryptbloom" },
      { value: "Achto (mage)", label: "Achto (Mage)" },
      { value: "Achto (non mage)", label: "Achto (Non-Mage)" },
      { value: "Deathwarden", label: "Deathwarden" },
      { value: "Sub. Ports", label: "Subjugation Ports" },
      { value: "Ganodermic", label: "Ganodermic" },
      { value: "TFN", label: "Teralith (T95)" },
      { value: "Deathdealer t90", label: "Deathdealer (T90)" }
    ],
    shield: [
      { value: "None", label: "None" },
      { value: "T90", label: "T90 Shield" },
      { value: "Spirit", label: "Spirit Shield" },
      { value: "T90 defender", label: "T90 Defender" }
    ]
  };
  
  return gearOptions[gearType] || [];
}

/**
 * Get pad options (0-6)
 */
export function getPadOptions() {
  return Array.from({ length: 7 }, (_, i) => ({
    value: i.toString(),
    label: i.toString()
  }));
}

/**
 * Get aura options
 */
export function getAuraOptions() {
  return [
    { value: "None", label: "None" },
    { value: "Aegis", label: "Aegis" },
    { value: "Zerk aura", label: "Berserker" }
  ];
}

/**
 * Get overload options
 */
export function getOverloadOptions() {
  return [
    { value: "None", label: "None" },
    { value: "Elder overload", label: "Elder Overload" }
  ];
}

/**
 * Get ability damage mode options
 */
export function getAbilityDamageModeOptions() {
  return [
    { value: "Total value", label: "Total Value" },
    { value: "Ability damage calc", label: "Calculate" }
  ];
}

/**
 * Get divert/res options
 */
export function getDivertResOptions() {
  return [
    { value: "None", label: "None" },
    { value: "Divert", label: "Divert" },
    { value: "Resonance", label: "Resonance" }
  ];
}

/**
 * Get hitcap options
 */
export function getHitcapOptions() {
  return [
    { value: "None", label: "None" },
    { value: "Green Hp", label: "Green HP" },
    { value: "Grey Hp", label: "Grey HP" }
  ];
}

/**
 * Get spec options for pad 4
 */
export function getSpecOptions() {
  return [
    { value: "Other", label: "Other" },
    { value: "Smoke", label: "Flames of Zamorak" },
    { value: "Decimation", label: "Decimation" },
    { value: "P7 Bomb", label: "P7 Bomb" }
  ];
}

/**
 * Get p7 mode options
 */
export function getP7ModeOptions() {
  return [
    { value: "Charge value", label: "Charge Value" },
    { value: "Iteration", label: "Iteration" },
    { value: "Red bar", label: "Red Bar" }
  ];
}