// IMPORTANT: paths are now ABSOLUTE from project root
import { calculatorState } from "/src/components/calculator/state/calculatorState.js";
import { eventBus, EVENTS } from "/src/components/calculator/state/eventBus.js";
import { calculatorManager } from "/src/components/calculator/calcs/calculatorManager.js";

// ---------- EXPOSE GLOBALS ----------
window.calculatorState = calculatorState;
window.eventBus = eventBus;
window.EVENTS = EVENTS;

// ---------- INPUT BRIDGE ----------
document.addEventListener("input", (e) => {
  const target = e.target;
  if (!target || !target.name) return;

  let value;
  if (target.type === "checkbox") {
    value = target.checked;
  } else if (target.type === "number") {
    value = target.value === "" ? 0 : Number(target.value);
  } else {
    value = target.value;
  }

  calculatorState.set(target.name, value);
});

document.addEventListener("change", (e) => {
  const target = e.target;
  if (!target || !target.name) return;

  if (target.tagName === "SELECT") {
    calculatorState.set(target.name, target.value);
  }
});

// ---------- RESULT BRIDGE ----------
eventBus.on(EVENTS.CALCULATION_COMPLETED, (results) => {
  document.dispatchEvent(
    new CustomEvent("calculator-results-updated", { detail: results })
  );
});

// ---------- INITIAL CALC ----------
calculatorManager.performCalculations();
