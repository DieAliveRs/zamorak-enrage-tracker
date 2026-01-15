// src/components/calculator/calcs/formulas/p7.js

import { pfloor, pmin, pmax } from './damage.js';
import { MAX_LIMITS } from '../constants.js';

/**
 * Red bar damage calculation (from Python redBar)
 */
export function redBar(charge_start, charge_rate, iteration) {
  let charge = charge_start;
  let red_bar = 0;
  
  for (let i = 0; i < iteration; i++) {
    charge += charge_rate;
    red_bar += pfloor(charge);
  }
  
  return pmin(red_bar, MAX_LIMITS.RED_BAR);
}

/**
 * Small bombs calculation (from Python smallBombs)
 */
export function smallBombs(red_bar, iteration) {
  return pfloor((red_bar / 100) * iteration);
}

/**
 * Iteration calculation (from Python iterationCalc)
 */
export function iterationCalc(charge_start, charge_rate, charge) {
  let newCharge = charge_start;
  let iteration = 0;
  
  while (newCharge < charge && iteration < MAX_LIMITS.ITERATION) {
    newCharge += charge_rate;
    iteration++;
  }
  
  return pmin(iteration, MAX_LIMITS.ITERATION);
}

/**
 * P7 main calculation (from Python p7)
 */
export function p7(mode, enrage, variables) {
  let iteration, red_bar, small_bombs, charge_value;
  
  if (mode === "Iteration") {
    iteration = pmin(variables.iteration_input, MAX_LIMITS.ITERATION);
    
    const charge_start = pmin(250 + (enrage / 5 - 20), MAX_LIMITS.CHARGE_START_MAX);
    const charge_rate = charge_start / 100;
    
    charge_value = iterationToCharge(iteration, enrage);
    red_bar = redBar(charge_start, charge_rate, iteration);
    small_bombs = smallBombs(red_bar, iteration);
    
  } else if (mode === "Charge value") {
    charge_value = variables.charge_input;
    
    const charge_start = pmin(250 + (enrage / 5 - 20), MAX_LIMITS.CHARGE_START_MAX);
    const charge_rate = charge_start / 100;
    
    iteration = iterationCalc(charge_start, charge_rate, charge_value);
    
    red_bar = redBar(charge_start, charge_rate, iteration);
    small_bombs = smallBombs(red_bar, iteration);
    
  } else if (mode === "Red bar") {
    red_bar = variables.red_input;
    small_bombs = 0;
    iteration = 0;
    charge_value = 0;
  } else {
    red_bar = 0;
    small_bombs = 0;
    iteration = 0;
    charge_value = 0;
  }
  
  return { red_bar, small_bombs, iteration, charge_value };
}

/**
 * Charge calculations (from Python chargeCalcs)
 */
export function chargeCalcs(enrage) {
  if (enrage < 100) {
    return { start: 0, cap: 0 };
  }
  
  const charge_start = pmin(250 + (enrage / 5 - 20), MAX_LIMITS.CHARGE_START_MAX);
  const charge_rate = charge_start / 100;
  const charge_cap = charge_start + charge_rate * MAX_LIMITS.ITERATION;
  
  return { 
    start: pfloor(charge_start), 
    cap: pfloor(charge_cap) 
  };
}

/**
 * Iteration to charge (from Python iterationToCharge)
 */
export function iterationToCharge(iteration, enrage) {
  const { start } = chargeCalcs(enrage);
  return pfloor(start + (start / 100) * pmin(iteration, MAX_LIMITS.ITERATION));
}