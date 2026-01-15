// src/components/calculator/calcs/formulas/pads.js

import { pfloor } from './damage.js';
import { disintegrateMod } from './damage.js';

/**
 * Pad 1 effects (from Python pad1eff)
 */
export function pad1eff(adren, stacks) {
  const gain = adren + 0.2 * adren * stacks;
  const dmg = stacks * 10;
  return { gain, dmg: pfloor(dmg) };
}

/**
 * Pad 2 effects (from Python pad2eff)
 */
export function pad2eff(stacks, cd, maxHp, fortCheck) {
  const cdr = stacks * 8 * 0.01;
  const finalCdTicks = pfloor(parseInt(cd) * (1 - cdr));
  const finalCdSec = Math.round(finalCdTicks * 0.6 * 10) / 10; // 1 decimal
  
  const thresh = pfloor(99 * 100 * 0.05 * stacks);
  
  let effHp;
  if (fortCheck) {
    effHp = maxHp - thresh + 1000;
  } else {
    effHp = maxHp - thresh;
  }
  
  return {
    cdTicks: finalCdTicks,
    cdSec: finalCdSec,
    thresh: thresh,
    effHp: effHp
  };
}

/**
 * Pad 4 effects (from Python pad4eff)
 */
export function pad4eff(dr, disint, spec, smoke = 0, infernus = false) {
  let b, effectiveSmoke;
  
  if (spec === "P7 Bomb") {
    b = 50;
    effectiveSmoke = 0;
  } else if (spec === "Decimation") {
    b = 40;
    effectiveSmoke = 0;
  } else if (spec === "Smoke") {
    b = 0;
    effectiveSmoke = infernus ? smoke * 3 : smoke;
  } else {
    b = 0;
    effectiveSmoke = 0;
  }
  
  const effectiveness = 100 - disintegrateMod(dr, disint, effectiveSmoke, b) * 100;
  return pfloor(effectiveness);
}

/**
 * Pad 6 effects (from Python pad6eff)
 */
export function pad6eff(stacks, maxHp, currentHp) {
  const hpNeeded = pfloor(maxHp * 0.6);
  let dmgBonus;
  
  if (currentHp / maxHp < 0.6) {
    dmgBonus = stacks * 6;
  } else {
    dmgBonus = 0;
  }
  
  const healingReduction = stacks * 10;
  
  return {
    hpNeeded,
    dmgBonus: pfloor(dmgBonus),
    healingReduction: pfloor(healingReduction)
  };
}