// src/components/calculator/calcs/formulas/damage.js

import { 
  AUTOS_BASE, AUTOS_SCALING, 
  INFERNUS_BASE, INFERNUS_SCALING,
  SMOKE_BASE, SMOKE_SCALING,
  SLAM_BASE, SLAM_ENRAGE_SCALING, SLAM_DISTANCE_SCALING,
  DECIMATION_BASE, DECIMATION_ENRAGE_SCALING, DECIMATION_TICK_SCALING,
  CAGE_BASE, CAGE_SCALING,
  MAX_LIMITS, PROTECTION_REDUCTIONS
} from '../constants.js';

// ============ Helper Functions ============

/**
 * Floor function for consistent rounding (Python math.floor)
 */
export function pfloor(value) {
  return Math.floor(value);
}

/**
 * Min function (Python min)
 */
export function pmin(...values) {
  return Math.min(...values);
}

/**
 * Max function (Python max)
 */
export function pmax(...values) {
  return Math.max(...values);
}

// ============ Damage Modifier Functions ============

/**
 * Disintegrate modifier (from Python disintegrateMod)
 */
export function disintegrateMod(defValue, disintegrate = 0, flames = 0, base = 0) {
  const reduction = pfloor(defValue * (disintegrate * 0.07 + flames * 0.01 + base / 100));
  return (reduction + (100 - defValue)) / 100;
}

/**
 * Check aura effects (from Python auraCheck)
 */
export function auraCheck(aura) {
  if (aura === "Zerk aura") {
    return { isZerk: true, isAegis: false };
  } else if (aura === "Aegis") {
    return { isZerk: false, isAegis: true };
  }
  return { isZerk: false, isAegis: false };
}

/**
 * Check spirit shield (from Python spiritShieldCheck)
 */
export function spiritShieldCheck(shield) {
  return shield === "Spirit";
}

/**
 * Protection prayer reduction (from Python protects)
 */
export function protects(check, eofCheck, enrage) {
  const eof = eofCheck ? 0.1 : 0;
  
  if (check === "autos") {
    return 1 - (0.6 + eof);
  } else if (check === "twinshot") {
    return 1 - (0.5 + eof);
  } else if (check === "slam") {
    return 1 - (0.5 + eof);
  } else if (check === "cage") {
    let reduction;
    if (enrage < 500) {
      reduction = 0.5 + eof;
    } else if (enrage < 800) {
      reduction = 0.4 + eof;
    } else if (enrage < 1100) {
      reduction = 0.35 + eof;
    } else {
      reduction = 0.3 + eof;
    }
    return 1 - reduction;
  }
  
  return 1;
}

/**
 * Curse reduction (from Python curse)
 */
export function curse(drain) {
  return 1 - drain / 100;
}

// ============ Core Damage Calculation Chain ============

/**
 * Generic damage modifier (from Python dmgMod)
 */
export function dmgMod(check, base, mod, stacks = 0) {
  if (check) {
    return pfloor(base * mod);
  } else {
    return pfloor(base * (1 - stacks * mod));
  }
}

/**
 * Alternate damage modifier (from Python dmgMod2)
 */
export function dmgMod2(check, base, mod) {
  if (check) {
    return base - pfloor(base * mod);
  }
  return base;
}

/**
 * Spirit shield modifier (from Python spiritMod)
 */
export function spiritMod(check, base, mod, pp, powderCheck) {
  if (check) {
    let ppRestoration;
    if (powderCheck) {
      ppRestoration = Math.ceil(pmin(0.025 * base, 990 - pp, 100));
    } else {
      ppRestoration = 0;
    }
    
    const reductionCap = (pp + ppRestoration) * 10;
    const reduction = pfloor(base * mod);
    
    return base - pmin(reduction, reductionCap);
  }
  return base;
}

/**
 * Death ward modifier (from Python deathwardMod)
 */
export function deathwardMod(check, base, currentHp, maxHp) {
  if (check) {
    const Current = currentHp;
    const Half = pfloor(maxHp / 2);
    const Quarter = pfloor(maxHp / 4);
    
    // Upper half portion
    let U;
    if (Current < Half) {
      U = 0;
    } else {
      U = pmin(Current - Half, base);
    }
    
    // Quarter-half portion
    let Qh;
    if (Current < Quarter) {
      Qh = 0;
    } else {
      const minCurrentHalf = pmin(Current, Half);
      const remaining = pmax(0, base - pmax(0, Current - Half));
      Qh = Math.ceil(pmin(minCurrentHalf - Quarter, remaining) * 0.95);
    }
    
    // Lower quarter portion
    const Ql = pmax(0, Math.ceil(base - pmax(0, Current - Quarter)) * 0.9);
    
    return pfloor(U + Qh + Ql);
  }
  return base;
}

/**
 * Phantom guard modifier (from Python phantomMod)
 */
export function phantomMod(check, base, abilDamage) {
  if (check) {
    const mod = 0.05;
    const reductionCap = pfloor(abilDamage * 0.1);
    const reduction = pfloor(base * mod);
    
    return base - pmin(reduction, reductionCap);
  }
  return base;
}

/**
 * Animate Dead modifier (from Python adMod)
 */
export function adMod(check, base, mod) {
  if (check) {
    if (base * 0.6 > mod) {
      return base - mod;
    } else {
      return pfloor(base * 0.4);
    }
  }
  return base;
}

// ============ Main Damage Calculation ============

/**
 * Main damage calculation chain (from Python damageCalculation)
 */
export function damageCalculation(
  base,
  // Boolean checks
  pulvCheck, cadeCheck, debilCheck, zerkAuraCheck, severCheck, enfeebleCheck,
  anchorCheck, darklightCheck, aegisCheck, sdCheck, disruptCheck, pad3Check, pad5Check,
  prayerCheck, anticipCheck, reflectCheck, darknessCheck, resCheck,
  immortCheck, zerkUltCheck, fulBookCheck, armorCheck, spiritCheck,
  cryptCheck, deathwardCheck, hhCheck, phantomCheck, adCheck,
  // Damage reduction values
  curseDR, cadeDR, debilDR, absorbStacks, sdDR, emeraldStacks, disruptDR,
  prayerDR, reflectDR, resDR, armorDR, cryptDR, abilDamage, adDR,
  // Other parameters
  pp, powderCheck, currentHp, maxHp
) {
  // Apply damage reduction chain (exactly like Python)
  let damage = base;
  
  damage = dmgMod(true, damage, curseDR); // curseDR = 1 - curseStacks/100
  damage = dmgMod(pulvCheck, damage, 0.75);
  damage = dmgMod(cadeCheck, damage, cadeDR);
  damage = dmgMod(debilCheck, damage, debilDR);
  damage = dmgMod(zerkAuraCheck, damage, 1.15);
  damage = dmgMod(severCheck, damage, 0.9);
  damage = dmgMod(enfeebleCheck, damage, 0.9);
  damage = dmgMod(anchorCheck, damage, 0.9);
  damage = dmgMod(darklightCheck, damage, 0.94)
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
  damage = dmgMod(darknessCheck, damage, 0.75);
  damage = dmgMod(resCheck, damage, resDR);
  damage = dmgMod(immortCheck, damage, 0.75);
  damage = dmgMod(zerkUltCheck, damage, 1.5);
  damage = dmgMod(fulBookCheck, damage, 1.1);
  damage = dmgMod(armorCheck, damage, armorDR);
  damage = spiritMod(spiritCheck, damage, 0.3, pp, powderCheck);
  damage = dmgMod(cryptCheck, damage, cryptDR);
  damage = deathwardMod(deathwardCheck, damage, currentHp, maxHp);
  damage = dmgMod(hhCheck, damage, 0.8);
  damage = phantomMod(phantomCheck, damage, abilDamage);
  damage = adMod(adCheck, damage, adDR);
  
  return pfloor(damage);
}

// ============ Mechanic Base Damage Functions ============

/**
 * Auto attack damage (from Python autos)
 */
export function autos(enrage, twinshot, greyCheck, aggroCheck, questCheck) {
  let maxDmg = AUTOS_BASE + AUTOS_SCALING * enrage;
  let minDmg = maxDmg * 0.7;
  
  if (!greyCheck) {
    maxDmg = pfloor(maxDmg / 1.5);
    minDmg = pfloor(minDmg / 1.5);
  }
  
  if (!aggroCheck) {
    maxDmg = pfloor(maxDmg * 0.75);
    minDmg = pfloor(minDmg * 0.75);
  }
  
  if (questCheck) {
    maxDmg = pfloor(maxDmg * 0.9);
    minDmg = pfloor(minDmg * 0.9);
  }
  
  const TS = pfloor((maxDmg * twinshot) / 10);
  
  return { maxDmg: pfloor(maxDmg), minDmg: pfloor(minDmg), TS };
}

/**
 * Infernus damage (from Python infernus)
 */
export function infernus(choke, puzzleboxCheck) {
  let base = INFERNUS_BASE + INFERNUS_SCALING * choke;
  
  if (puzzleboxCheck) {
    base = pfloor(base * 0.35);
  }
  
  return pfloor(base);
}

/**
 * Smoke/flames damage (from Python smoke)
 */
export function smoke(enrage, stacks, infernusCheck) {
  let base = (SMOKE_BASE + SMOKE_SCALING * enrage) * stacks;
  
  if (infernusCheck) {
    return { damage: base * 1.5, effectiveStacks: stacks * 3 };
  } else {
    return { damage: base, effectiveStacks: stacks };
  }
}

/**
 * Slam damage (from Python slam)
 */
export function slam(enrage, distance) {
  let base = pmin(SLAM_BASE + SLAM_ENRAGE_SCALING * enrage, MAX_LIMITS.SLAM_MAX);
  const final = pfloor(base * (1 - SLAM_DISTANCE_SCALING * distance));
  
  return { primary: final, secondary: pfloor(final / 2) };
}

/**
 * Decimation damage (from Python decimation)
 */
export function decimation(enrage, stun) {
  const base = DECIMATION_BASE + DECIMATION_ENRAGE_SCALING * enrage;
  const final = base * DECIMATION_TICK_SCALING * stun;
  
  return pfloor(final);
}

/**
 * Cage damage (from Python cage)
 */
export function cage(enrage, team_size, questCheck) {
  let base = pmin(pfloor(CAGE_BASE + CAGE_SCALING * enrage) * team_size, MAX_LIMITS.CAGE_MAX);
  
  if (questCheck) {
    base = pfloor(base * 0.9);
  }
  
  return pfloor(base);
}