// src/client/calculatorClient.js
import { calculatorState } from "../components/calculator/state/calculatorState.js";
import { eventBus, EVENTS } from "../components/calculator/state/eventBus.js";
import { calculatorManager } from "../components/calculator/calcs/calculatorManager.js";

window.calculatorState = calculatorState;
window.eventBus = eventBus;
window.EVENTS = EVENTS;

// INPUT BRIDGE
document.addEventListener("input", (e) => {
  const t = e.target;
  if (!t?.name) return;

  const value =
    t.type === "checkbox"
      ? t.checked
      : t.type === "number"
      ? t.value === "" ? 0 : Number(t.value)
      : t.value;

  calculatorState.set(t.name, value);
});

document.addEventListener("change", (e) => {
  const t = e.target;
  if (t?.tagName === "SELECT") {
    calculatorState.set(t.name, t.value);
  }
});

// RESULT BRIDGE
eventBus.on(EVENTS.CALCULATION_COMPLETED, (results) => {
  document.dispatchEvent(
    new CustomEvent("calculator-results-updated", { detail: results })
  );
});

// INITIAL CALC
calculatorManager.performCalculations();
