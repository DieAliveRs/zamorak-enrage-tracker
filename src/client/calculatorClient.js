import { calculatorState } from '../state/calculatorState.js';
import { eventBus, EVENTS } from '../state/eventBus.js';
import { calculatorManager } from '../calcs/calculatorManager.js';

// Expose globals for Astro components
window.calculatorState = calculatorState;
window.eventBus = eventBus;

// ---------- INPUT BRIDGE ----------
// Any InputField / SelectMenu / Checkbox must dispatch these events

document.addEventListener('input', (e) => {
  const target = e.target;
  if (!target?.name) return;

  const type = target.type;
  const value =
    type === 'checkbox'
      ? target.checked
      : type === 'number'
      ? target.value === '' ? 0 : Number(target.value)
      : target.value;

  calculatorState.set(target.name, value);
});

document.addEventListener('change', (e) => {
  const target = e.target;
  if (!target?.name) return;

  if (target.tagName === 'SELECT') {
    calculatorState.set(target.name, target.value);
  }
});

// ---------- RESULT BRIDGE ----------
eventBus.on(EVENTS.CALCULATION_COMPLETED, (results) => {
  document.dispatchEvent(
    new CustomEvent('calculator-results-updated', { detail: results })
  );
});

// ---------- INITIAL CALC ----------
calculatorManager.performCalculations();
