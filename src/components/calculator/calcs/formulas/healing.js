// src/components/calculator/calcs/formulas/healing.js

import { dmgMod, dmgMod2, pfloor } from './damage.js';
import { getTier } from './armor.js';

/**
 * Healing calculation (from Python healingCalculation)
 */
export function healingCalculation(
  base,
  // Boolean checks
  pulvCheck, cadeCheck, debilCheck, zerkAuraCheck, severCheck, enfeebleCheck,
  anchorCheck, darklightCheck, aegisCheck, sdCheck, disruptCheck, pad3Check, pad5Check,
  prayerCheck, anticipCheck, reflectCheck, darknessCheck, resCheck,
  // Damage reduction values
  curseDR, cadeDR, debilDR, absorbStacks, sdDR, emeraldStacks, disruptDR,
  prayerDR, reflectDR, resDR,
  // Shield parameters
  shield, boneshield
) {
  // Apply damage reduction chain up to res
  let damage = base;
  let darkness = 0;
  let res = 0;
  
  damage = dmgMod(true, damage, curseDR);
  damage = dmgMod(pulvCheck, damage, 0.75);
  damage = dmgMod(cadeCheck, damage, cadeDR);
  damage = dmgMod(debilCheck, damage, debilDR);
  damage = dmgMod(zerkAuraCheck, damage, 1.15);
  damage = dmgMod(severCheck, damage, 0.9);
  damage = dmgMod(enfeebleCheck, damage, 0.9);
  damage = dmgMod(anchorCheck, damage, 0.9);
  damage = dmgMod(darklightCheck, damage, 0.94);
  damage = dmgMod(false, damage, 0.05, absorbStacks);
  damage = dmgMod2(aegisCheck, damage, 0.1);
  damage = dmgMod(sdCheck, damage, sdDR);
  damage = dmgMod(false, damage, 0.01, emeraldStacks);
  damage = dmgMod(disruptCheck, damage, disruptDR);
  damage = dmgMod(pad3Check, damage, 1.05);
  damage = dmgMod(pad5Check, damage, 0.95);
  damage = dmgMod(prayerCheck, damage, prayerDR);
  damage = dmgMod(anticipCheck, damage, 0.9);
  damage = dmgMod(reflectCheck, damage, reflectDR);
  darkness = dmgMod(darknessCheck, damage, 0.75);
  res = dmgMod(resCheck, damage, resDR);

  // Calculate healing from blocked damage
  const blocked = darkness - res;
  
  // Determine shield tier for healing percentage
  let shieldTier;
  if (shield === "None") {
    shieldTier = boneshield;
  } else {
    shieldTier = getTier(shield);
  }
    
  const healingPercentage = pfloor(50 + shieldTier * 0.5) / 100;
  const healing = blocked * healingPercentage;
  
  return pfloor(healing);
}

/**
 * Divert adren gain calculation (from Python divertCalculation)
 */
export function divertCalculation(
  base,
  // Boolean checks
  pulvCheck, cadeCheck, debilCheck, zerkAuraCheck, severCheck, enfeebleCheck,
  anchorCheck, darklightCheck, aegisCheck, sdCheck, disruptCheck, pad3Check, pad5Check,
  prayerCheck, anticipCheck, reflectCheck, darknessCheck, resCheck,
  // Damage reduction values
  curseDR, cadeDR, debilDR, absorbStacks, sdDR, emeraldStacks, disruptDR,
  prayerDR, reflectDR, resDR,
  // Shield parameters
  shield, boneshield
) {
  // Apply same damage reduction chain as healing
  let damage = base;
  let darkness = 0;
  let res = 0;
  
  damage = dmgMod(true, damage, curseDR);
  damage = dmgMod(pulvCheck, damage, 0.75);
  damage = dmgMod(cadeCheck, damage, cadeDR);
  damage = dmgMod(debilCheck, damage, debilDR);
  damage = dmgMod(zerkAuraCheck, damage, 1.15);
  damage = dmgMod(severCheck, damage, 0.9);
  damage = dmgMod(enfeebleCheck, damage, 0.9);
  damage = dmgMod(anchorCheck, damage, 0.9);
  damage = dmgMod(darklightCheck, damage, 0.94);
  damage = dmgMod(false, damage, 0.05, absorbStacks);
  damage = dmgMod2(aegisCheck, damage, 0.1);
  damage = dmgMod(sdCheck, damage, sdDR);
  damage = dmgMod(false, damage, 0.01, emeraldStacks);
  damage = dmgMod(disruptCheck, damage, disruptDR);
  damage = dmgMod(pad3Check, damage, 1.05);
  damage = dmgMod(pad5Check, damage, 0.95);
  damage = dmgMod(prayerCheck, damage, prayerDR);
  damage = dmgMod(anticipCheck, damage, 0.9);
  damage = dmgMod(reflectCheck, damage, reflectDR);
  darkness = dmgMod(darknessCheck, damage, 0.75);
  res = dmgMod(resCheck, damage, resDR);

  const blocked = darkness - res;
  
  // Determine shield tier
  let shieldTier;
  if (shield === "None") {
    shieldTier = boneshield;
  } else {
    shieldTier = getTier(shield);
  }
  
  // Calculate adren gain (from Python divertCalculation)
  let adrenGain = 0;
  let remainingBlocked = Math.min(blocked, 12000);
  
  // >9000 portion
  if (remainingBlocked > 9000) {
    const portion = remainingBlocked - 9000;
    adrenGain += 0.1 * (pfloor(portion / (200 - shieldTier)));
    remainingBlocked = 9000;
  }
  
  // 6000-9000 portion
  if (remainingBlocked > 6000) {
    const portion = remainingBlocked - 6000;
    adrenGain += 0.4 * (pfloor(portion / (200 - shieldTier)));
    remainingBlocked = 6000;
  }
  
  // 3000-6000 portion
  if (remainingBlocked > 3000) {
    const portion = remainingBlocked - 3000;
    adrenGain += 0.6 * (pfloor(portion / (200 - shieldTier)));
    remainingBlocked = 3000;
  }
  
  // 0-3000 portion
  if (remainingBlocked > 0) {
    adrenGain += 0.8 * (pfloor(remainingBlocked / (200 - shieldTier)));
  }
  
  return Math.round(adrenGain * 10) / 10; // Round to 1 decimal
}