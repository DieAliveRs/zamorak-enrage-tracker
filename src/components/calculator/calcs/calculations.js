// src/components/calculator/calcs/calculations.js (continued)

// Import all formula modules
import * as armor from './formulas/armor.js';
import * as damage from './formulas/damage.js';
import * as healing from './formulas/healing.js';
import * as p7 from './formulas/p7.js';
import * as hp from './formulas/hp.js';
import * as pads from './formulas/pads.js';
import * as reflect from './formulas/reflect.js';
import { getTier } from './formulas/armor.js';
import { pfloor } from './formulas/damage.js';
import { HITCAPS } from './constants.js';

// ============ Helper Functions ============

/**
 * Get common calculation parameters from state
 */
function getCommonParams(state) {
  // Calculate ability damage
  const abilityDamage = armor.abilDamageMode(state.abilDamageMode, state);
  
  // Calculate armor and crypt modifiers
  const armorDR = armor.armorReduction(
    state.helm, state.top, state.bottoms, state.gloves, state.boots,
    state.shield, state.fort, state.def
  );
  
  const crypt = armor.cryptMod(
    state.helm, state.top, state.bottoms, state.gloves, state.boots
  );
  
  // Calculate AD reduction
  const adDR = armor.animateDead(
    state.helm, state.top, state.bottoms, state.gloves, state.boots,
    state.shield, state.ovl, state.aura, state.def
  );
  
  // Aura checks
  const { isZerk: zerkAuraCheck, isAegis: aegisCheck } = damage.auraCheck(state.aura);
  
  // Spirit shield check
  const spiritCheck = damage.spiritShieldCheck(state.shield);
  
  // Curse reductions
  const curseDR = damage.curse(state.affliction);
  const desolationDR = damage.curse(state.desolation);
  
  // Disintegrate modifiers
  const cadeDR = damage.disintegrateMod(100, state.pad4);
  const debilDR = damage.disintegrateMod(50, state.pad4);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  // Protection reductions
  const autosDR = damage.protects("autos", state.eof, state.enrage);
  const twinshotDR = damage.protects("twinshot", state.eof, state.enrage);
  const slamDR = damage.protects("slam", state.eof, state.enrage);
  const cageDR = damage.protects("cage", state.eof, state.enrage);
  
  return {
    abilityDamage,
    armorDR,
    cryptMelee: crypt.meleeMod,
    cryptMagic: crypt.magicMod,
    adDR,
    zerkAuraCheck,
    aegisCheck,
    spiritCheck,
    curseDR,
    desolationDR,
    cadeDR,
    debilDR,
    sdDR,
    disruptDR,
    reflectDR,
    resDR,
    autosDR,
    twinshotDR,
    slamDR,
    cageDR,
    state
  };
}

// ============ Mage Auto Calculations ============

/**
 * Calculate mage auto damage (from Python calcMageAutos)
 */
export function calcMageAutos(state) {
  const params = getCommonParams(state);
  const autosBase = damage.autos(state.enrage, state.pad1, state.grey, state.aggro, state.totg);
  
  const maxFinal = damage.damageCalculation(
    autosBase.maxDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const minFinal = damage.damageCalculation(
    autosBase.minDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const avgFinal = damage.damageCalculation(
    (autosBase.maxDmg + autosBase.minDmg) / 2,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const tsFinal = damage.damageCalculation(
    autosBase.TS,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.twinshotDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  return {
    max: pfloor(maxFinal),
    min: pfloor(minFinal),
    avg: pfloor(avgFinal),
    ts: pfloor(tsFinal),
    base: autosBase
  };
}

/**
 * Calculate range auto damage (from Python calcRangeAutos)
 */
export function calcRangeAutos(state) {
  const params = getCommonParams(state);
  const autosBase = damage.autos(state.enrage, state.pad1, state.grey, state.aggro, state.totg);
  
  const maxFinal = damage.damageCalculation(
    autosBase.maxDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, state.phantom, state.ad,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const minFinal = damage.damageCalculation(
    autosBase.minDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, state.phantom, state.ad,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const avgFinal = damage.damageCalculation(
    (autosBase.maxDmg + autosBase.minDmg) / 2,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, state.phantom, state.ad,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const tsFinal = damage.damageCalculation(
    autosBase.TS,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.twinshotDR, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  return {
    max: pfloor(maxFinal),
    min: pfloor(minFinal),
    avg: pfloor(avgFinal),
    ts: pfloor(tsFinal),
    base: autosBase
  };
}

// ============ Special Attack Calculations ============

/**
 * Calculate slam damage (from Python calcSlam)
 */
export function calcSlam(state) {
  const params = getCommonParams(state);
  const slamBase = damage.slam(state.enrage, state.slam);
  
  const final1 = damage.damageCalculation(
    slamBase.primary,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.slamDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMelee, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const final2 = damage.damageCalculation(
    slamBase.secondary,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.slamDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMelee, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  return {
    primary: pfloor(final1),
    secondary: pfloor(final2),
    base: slamBase
  };
}

/**
 * Calculate infernus damage (from Python calcInfernus)
 */
export function calcInfernus(state) {
  const minInfernus = damage.infernus(state.choke, state.puzzlebox);
  const maxInfernus = pfloor(minInfernus * 1.1);
  const avgInfernus = pfloor((minInfernus + maxInfernus) / 2);
  
  // Apply hellhound if active
  const minHh = damage.dmgMod(state.hh, minInfernus, 0.8);
  const maxHh = damage.dmgMod(state.hh, maxInfernus, 0.8);
  const avgHh = damage.dmgMod(state.hh, avgInfernus, 0.8);
  
  return {
    min: pfloor(minHh),
    max: pfloor(maxHh),
    avg: pfloor(avgHh),
    base: { min: minInfernus, max: maxInfernus, avg: avgInfernus }
  };
}

/**
 * Calculate smoke damage (from Python calcSmoke)
 */
export function calcSmoke(state) {
  const params = getCommonParams(state);
  const smokeResult = damage.smoke(state.enrage, state.smoke, state.infernus);
  
  // Adjust disintegrate mods for flames
  const flamesCadeDR = damage.disintegrateMod(100, state.pad4, smokeResult.effectiveStacks);
  const flamesDebilDR = damage.disintegrateMod(50, state.pad4, smokeResult.effectiveStacks);
  const flamesSdDR = damage.disintegrateMod(state.sd, state.pad4, smokeResult.effectiveStacks);
  const flamesDisruptDR = flamesCadeDR;
  const flamesReflectDR = flamesDebilDR;
  const flamesResDR = flamesCadeDR;
  
  const final = damage.damageCalculation(
    smokeResult.damage,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, flamesCadeDR, flamesDebilDR, state.absorb, flamesSdDR, state.emerald,
    flamesDisruptDR, 0, flamesReflectDR, flamesResDR, params.armorDR,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  return {
    damage: pfloor(final),
    base: smokeResult.damage,
    flames: smokeResult.effectiveStacks
  };
}

/**
 * Calculate decimation damage (from Python calcDecimation)
 */
export function calcDecimation(state, releaseTick = null) {
  const params = getCommonParams(state);
  const tick = releaseTick || state.decimation;
  const decimationBase = damage.decimation(state.enrage, tick);
  
  // PAD4 adds 40% effectiveness for decimation
  const cadeDR = damage.disintegrateMod(100, state.pad4, 0, 40);
  const debilDR = damage.disintegrateMod(50, state.pad4, 0, 40);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4, 0, 40);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  const final = damage.damageCalculation(
    decimationBase,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR, params.armorDR,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  return {
    damage: pfloor(final),
    base: decimationBase,
    ticks: tick
  };
}

/**
 * Calculate cage damage (from Python calcCage)
 */
export function calcCage(state) {
  const params = getCommonParams(state);
  const cageBase = damage.cage(state.enrage, state.teamsize, state.totg);
  
  const final = damage.damageCalculation(
    cageBase,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.cageDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  return {
    damage: pfloor(final),
    base: cageBase
  };
}

// ============ Phase 7 Calculations ============

/**
 * Calculate big bomb damage (from Python calcBigBomb)
 */
export function calcBigBomb(state) {
  const params = getCommonParams(state);
  const p7Result = p7.p7(state.mode, state.enrage, state);
  
  const bigBomb = p7Result.red_bar;
  const bigBombMax = bigBomb * 1.1;
  const bigBombAvg = bigBomb * 1.05;
  
  // PAD4 adds 50% effectiveness for P7 bomb
  const cadeDR = damage.disintegrateMod(100, state.pad4, 0, 50);
  const debilDR = damage.disintegrateMod(50, state.pad4, 0, 50);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4, 0, 50);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  const bigMaxFinal = damage.damageCalculation(
    bigBombMax,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR, 1,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const bigMinFinal = damage.damageCalculation(
    bigBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR, 1,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const bigAvgFinal = damage.damageCalculation(
    bigBombAvg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR, 1,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  return {
    max: pfloor(bigMaxFinal),
    min: pfloor(bigMinFinal),
    avg: pfloor(bigAvgFinal),
    base: { min: bigBomb, max: bigBombMax, avg: bigBombAvg }
  };
}

/**
 * Calculate small bomb damage (from Python calcSmallBomb)
 */
export function calcSmallBomb(state) {
  const params = getCommonParams(state);
  const p7Result = p7.p7(state.mode, state.enrage, state);
  
  const smallBomb = p7Result.small_bombs;
  const smallTsBomb = pfloor((smallBomb * state.pad1) / 10);
  
  const smallFinal = damage.damageCalculation(
    smallBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, 0, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  const smallTsFinal = damage.damageCalculation(
    smallTsBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, 0, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp
  );
  
  return {
    normal: pfloor(smallFinal),
    twinshot: pfloor(smallTsFinal),
    base: { normal: smallBomb, twinshot: smallTsBomb }
  };
}

// ============ Healing Calculations ============

/**
 * Calculate mage auto healing (from Python calcMageAutosHealing)
 */
export function calcMageAutosHealing(state) {
  const params = getCommonParams(state);
  const autosBase = damage.autos(state.enrage, state.pad1, state.grey, state.aggro, state.totg);
  
  const maxHealing = healing.healingCalculation(
    autosBase.maxDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const minHealing = healing.healingCalculation(
    autosBase.minDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const avgHealing = healing.healingCalculation(
    (autosBase.maxDmg + autosBase.minDmg) / 2,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const tsHealing = healing.healingCalculation(
    autosBase.TS,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.twinshotDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return {
    max: pfloor(maxHealing),
    min: pfloor(minHealing),
    avg: pfloor(avgHealing),
    ts: pfloor(tsHealing)
  };
}

/**
 * Calculate range auto healing (from Python calcRangeAutosHealing)
 */
export function calcRangeAutosHealing(state) {
  const params = getCommonParams(state);
  const autosBase = damage.autos(state.enrage, state.pad1, state.grey, state.aggro, state.totg);
  
  const maxHealing = healing.healingCalculation(
    autosBase.maxDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const minHealing = healing.healingCalculation(
    autosBase.minDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const avgHealing = healing.healingCalculation(
    (autosBase.maxDmg + autosBase.minDmg) / 2,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const tsHealing = healing.healingCalculation(
    autosBase.TS,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.twinshotDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return {
    max: pfloor(maxHealing),
    min: pfloor(minHealing),
    avg: pfloor(avgHealing),
    ts: pfloor(tsHealing)
  };
}

/**
 * Calculate slam healing (from Python calcSlamHealing)
 */
export function calcSlamHealing(state) {
  const params = getCommonParams(state);
  const slamBase = damage.slam(state.enrage, state.slam);
  
  const slam1Healing = healing.healingCalculation(
    slamBase.primary,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.slamDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const slam2Healing = healing.healingCalculation(
    slamBase.secondary,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.slamDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return {
    primary: pfloor(slam1Healing),
    secondary: pfloor(slam2Healing)
  };
}

/**
 * Calculate smoke healing (from Python calcSmokeHealing)
 */
export function calcSmokeHealing(state) {
  const params = getCommonParams(state);
  const smokeResult = damage.smoke(state.enrage, state.smoke, state.infernus);
  
  const flamesCadeDR = damage.disintegrateMod(100, state.pad4, smokeResult.effectiveStacks);
  const flamesDebilDR = damage.disintegrateMod(50, state.pad4, smokeResult.effectiveStacks);
  const flamesSdDR = damage.disintegrateMod(state.sd, state.pad4, smokeResult.effectiveStacks);
  const flamesDisruptDR = flamesCadeDR;
  const flamesReflectDR = flamesDebilDR;
  const flamesResDR = flamesCadeDR;
  
  const smokeHealing = healing.healingCalculation(
    smokeResult.damage,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, flamesCadeDR, flamesDebilDR, state.absorb, flamesSdDR, state.emerald,
    flamesDisruptDR, 0, flamesReflectDR, flamesResDR,
    state.shield, state.boneshield
  );
  
  return pfloor(smokeHealing);
}

/**
 * Calculate decimation healing (from Python calcDecimationHealing)
 */
export function calcDecimationHealing(state, releaseTick = null) {
  const params = getCommonParams(state);
  const tick = releaseTick || state.decimation;
  const decimationBase = damage.decimation(state.enrage, tick);
  
  const cadeDR = damage.disintegrateMod(100, state.pad4, 0, 40);
  const debilDR = damage.disintegrateMod(50, state.pad4, 0, 40);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4, 0, 40);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  const decimationHealing = healing.healingCalculation(
    decimationBase,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR,
    state.shield, state.boneshield
  );
  
  return pfloor(decimationHealing);
}

/**
 * Calculate cage healing (from Python calcCageHealing)
 */
export function calcCageHealing(state) {
  const params = getCommonParams(state);
  const cageBase = damage.cage(state.enrage, state.teamsize, state.totg);
  
  const cageHealing = healing.healingCalculation(
    cageBase,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.cageDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return pfloor(cageHealing);
}

/**
 * Calculate big bomb healing (from Python calcBigBombHealing)
 */
export function calcBigBombHealing(state) {
  const params = getCommonParams(state);
  const p7Result = p7.p7(state.mode, state.enrage, state);
  
  const bigBomb = p7Result.red_bar;
  const bigBombMax = bigBomb * 1.1;
  const bigBombAvg = bigBomb * 1.05;
  
  const cadeDR = damage.disintegrateMod(100, state.pad4, 0, 50);
  const debilDR = damage.disintegrateMod(50, state.pad4, 0, 50);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4, 0, 50);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  const bigMaxHealFinal = healing.healingCalculation(
    bigBombMax,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR,
    state.shield, state.boneshield
  );
  
  const bigMinHealFinal = healing.healingCalculation(
    bigBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR,
    state.shield, state.boneshield
  );
  
  const bigAvgHealFinal = healing.healingCalculation(
    bigBombAvg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR,
    state.shield, state.boneshield
  );
  
  return {
    max: pfloor(bigMaxHealFinal),
    min: pfloor(bigMinHealFinal),
    avg: pfloor(bigAvgHealFinal)
  };
}

/**
 * Calculate small bomb healing (from Python calcSmallBombHealing)
 */
export function calcSmallBombHealing(state) {
  const params = getCommonParams(state);
  const p7Result = p7.p7(state.mode, state.enrage, state);
  
  const smallBomb = p7Result.small_bombs;
  const smallTsBomb = pfloor((smallBomb * state.pad1) / 10);
  
  const smallFinalHealing = healing.healingCalculation(
    smallBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, 0, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const smallTsFinalHealing = healing.healingCalculation(
    smallTsBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, 0, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return {
    normal: pfloor(smallFinalHealing),
    twinshot: pfloor(smallTsFinalHealing)
  };
}

// ============ Divert Calculations ============

/**
 * Calculate mage auto divert (from Python calcMageAutosDivert)
 */
export function calcMageAutosDivert(state) {
  const params = getCommonParams(state);
  const autosBase = damage.autos(state.enrage, state.pad1, state.grey, state.aggro, state.totg);
  
  const maxDivert = healing.divertCalculation(
    autosBase.maxDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const minDivert = healing.divertCalculation(
    autosBase.minDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const avgDivert = healing.divertCalculation(
    (autosBase.maxDmg + autosBase.minDmg) / 2,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const tsDivert = healing.divertCalculation(
    autosBase.TS,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.twinshotDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return {
    max: maxDivert,
    min: minDivert,
    avg: avgDivert,
    ts: tsDivert
  };
}

/**
 * Calculate range auto divert (from Python calcRangeAutosDivert)
 */
export function calcRangeAutosDivert(state) {
  const params = getCommonParams(state);
  const autosBase = damage.autos(state.enrage, state.pad1, state.grey, state.aggro, state.totg);
  
  const maxDivert = healing.divertCalculation(
    autosBase.maxDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const minDivert = healing.divertCalculation(
    autosBase.minDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const avgDivert = healing.divertCalculation(
    (autosBase.maxDmg + autosBase.minDmg) / 2,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const tsDivert = healing.divertCalculation(
    autosBase.TS,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.twinshotDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return {
    max: maxDivert,
    min: minDivert,
    avg: avgDivert,
    ts: tsDivert
  };
}

/**
 * Calculate slam divert (from Python calcSlamDivert)
 */
export function calcSlamDivert(state) {
  const params = getCommonParams(state);
  const slamBase = damage.slam(state.enrage, state.slam);
  
  const slam1Divert = healing.divertCalculation(
    slamBase.primary,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.slamDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const slam2Divert = healing.divertCalculation(
    slamBase.secondary,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.slamDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return {
    primary: slam1Divert,
    secondary: slam2Divert
  };
}

/**
 * Calculate smoke divert (from Python calcSmokeDivert)
 */
export function calcSmokeDivert(state) {
  const params = getCommonParams(state);
  const smokeResult = damage.smoke(state.enrage, state.smoke, state.infernus);
  
  const flamesCadeDR = damage.disintegrateMod(100, state.pad4, smokeResult.effectiveStacks);
  const flamesDebilDR = damage.disintegrateMod(50, state.pad4, smokeResult.effectiveStacks);
  const flamesSdDR = damage.disintegrateMod(state.sd, state.pad4, smokeResult.effectiveStacks);
  const flamesDisruptDR = flamesCadeDR;
  const flamesReflectDR = flamesDebilDR;
  const flamesResDR = flamesCadeDR;
  
  const smokeDivert = healing.divertCalculation(
    smokeResult.damage,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, flamesCadeDR, flamesDebilDR, state.absorb, flamesSdDR, state.emerald,
    flamesDisruptDR, 0, flamesReflectDR, flamesResDR,
    state.shield, state.boneshield
  );
  
  return smokeDivert;
}

/**
 * Calculate decimation divert (from Python calcDecimationDivert)
 */
export function calcDecimationDivert(state, releaseTick = null) {
  const params = getCommonParams(state);
  const tick = releaseTick || state.decimation;
  const decimationBase = damage.decimation(state.enrage, tick);
  
  const cadeDR = damage.disintegrateMod(100, state.pad4, 0, 40);
  const debilDR = damage.disintegrateMod(50, state.pad4, 0, 40);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4, 0, 40);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  const decimationDivert = healing.divertCalculation(
    decimationBase,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR,
    state.shield, state.boneshield
  );
  
  return decimationDivert;
}

/**
 * Calculate cage divert (from Python calcCageDivert)
 */
export function calcCageDivert(state) {
  const params = getCommonParams(state);
  const cageBase = damage.cage(state.enrage, state.teamsize, state.totg);
  
  const cageDivert = healing.divertCalculation(
    cageBase,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.cageDR, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return cageDivert;
}

/**
 * Calculate big bomb divert (from Python calcBigBombDivert)
 */
export function calcBigBombDivert(state) {
  const params = getCommonParams(state);
  const p7Result = p7.p7(state.mode, state.enrage, state);
  
  const bigBomb = p7Result.red_bar;
  const bigBombMax = bigBomb * 1.1;
  const bigBombAvg = bigBomb * 1.05;
  
  const cadeDR = damage.disintegrateMod(100, state.pad4, 0, 50);
  const debilDR = damage.disintegrateMod(50, state.pad4, 0, 50);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4, 0, 50);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  const bigMaxDivertFinal = healing.divertCalculation(
    bigBombMax,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR,
    state.shield, state.boneshield
  );
  
  const bigMinDivertFinal = healing.divertCalculation(
    bigBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR,
    state.shield, state.boneshield
  );
  
  const bigAvgDivertFinal = healing.divertCalculation(
    bigBombAvg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR,
    state.shield, state.boneshield
  );
  
  return {
    max: bigMaxDivertFinal,
    min: bigMinDivertFinal,
    avg: bigAvgDivertFinal
  };
}

/**
 * Calculate small bomb divert (from Python calcSmallBombDivert)
 */
export function calcSmallBombDivert(state) {
  const params = getCommonParams(state);
  const p7Result = p7.p7(state.mode, state.enrage, state);
  
  const smallBomb = p7Result.small_bombs;
  const smallTsBomb = pfloor((smallBomb * state.pad1) / 10);
  
  const smallFinalDivert = healing.divertCalculation(
    smallBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, 0, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  const smallTsFinalDivert = healing.divertCalculation(
    smallTsBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, 0, params.reflectDR, params.resDR,
    state.shield, state.boneshield
  );
  
  return {
    normal: smallFinalDivert,
    twinshot: smallTsFinalDivert
  };
}

// ============ Reflect Calculations ============

/**
 * Calculate mage auto reflect damage (from Python calcMageAutosReflect)
 */
export function calcMageAutosReflect(state) {
  const params = getCommonParams(state);
  const autosBase = damage.autos(state.enrage, state.pad1, state.grey, state.aggro, state.totg);
  
  // Get pad6 effects for reflect multiplier
  const pad6Effects = pads.pad6eff(state.pad6, state.maxhp, state.currenthp);
  const pad6Stacks = 1 + pad6Effects.dmgBonus / 100;
  
  // Check for DTB
  const dtbEquipCheck = state.gloves === "Deathtouch bracelet";
  
  // Calculate reflect damage for each auto type
  const maxReflect = reflect.reflectCalculation(
    autosBase.maxDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const minReflect = reflect.reflectCalculation(
    autosBase.minDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const avgReflect = reflect.reflectCalculation(
    (autosBase.maxDmg + autosBase.minDmg) / 2,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const tsReflect = reflect.reflectCalculation(
    autosBase.TS,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.curseDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.twinshotDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  // Apply hitcaps
  const maxFinal = reflect.applyHitcaps(maxReflect, state.hitcaps);
  const minFinal = reflect.applyHitcaps(minReflect, state.hitcaps);
  const avgFinal = reflect.applyHitcaps(avgReflect, state.hitcaps);
  const tsFinal = reflect.applyHitcaps(tsReflect, state.hitcaps);
  
  return {
    max: maxFinal,
    min: minFinal,
    avg: avgFinal,
    ts: tsFinal
  };
}

/**
 * Calculate range auto reflect damage (from Python calcRangeAutosReflect)
 */
export function calcRangeAutosReflect(state) {
  const params = getCommonParams(state);
  const autosBase = damage.autos(state.enrage, state.pad1, state.grey, state.aggro, state.totg);
  
  // Get pad6 effects for reflect multiplier
  const pad6Effects = pads.pad6eff(state.pad6, state.maxhp, state.currenthp);
  const pad6Stacks = 1 + pad6Effects.dmgBonus / 100;
  
  // Check for DTB
  const dtbEquipCheck = state.gloves === "Deathtouch bracelet";
  
  // Calculate reflect damage for each auto type
  const maxReflect = reflect.reflectCalculation(
    autosBase.maxDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const minReflect = reflect.reflectCalculation(
    autosBase.minDmg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const avgReflect = reflect.reflectCalculation(
    (autosBase.maxDmg + autosBase.minDmg) / 2,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.autosDR, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const tsReflect = reflect.reflectCalculation(
    autosBase.TS,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    params.desolationDR, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.twinshotDR, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  // Apply hitcaps
  const maxFinal = reflect.applyHitcaps(maxReflect, state.hitcaps);
  const minFinal = reflect.applyHitcaps(minReflect, state.hitcaps);
  const avgFinal = reflect.applyHitcaps(avgReflect, state.hitcaps);
  const tsFinal = reflect.applyHitcaps(tsReflect, state.hitcaps);
  
  return {
    max: maxFinal,
    min: minFinal,
    avg: avgFinal,
    ts: tsFinal
  };
}

/**
 * Calculate slam reflect damage (from Python calcSlamReflect)
 */
export function calcSlamReflect(state) {
  const params = getCommonParams(state);
  const slamBase = damage.slam(state.enrage, state.slam);
  
  // Get pad6 effects for reflect multiplier
  const pad6Effects = pads.pad6eff(state.pad6, state.maxhp, state.currenthp);
  const pad6Stacks = 1 + pad6Effects.dmgBonus / 100;
  
  // Check for DTB
  const dtbEquipCheck = state.gloves === "Deathtouch bracelet";
  
  // Calculate reflect damage
  const slam1Reflect = reflect.reflectCalculation(
    slamBase.primary,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.slamDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMelee, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const slam2Reflect = reflect.reflectCalculation(
    slamBase.secondary,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.slamDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMelee, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  // Apply hitcaps
  const slam1Final = reflect.applyHitcaps(slam1Reflect, state.hitcaps);
  const slam2Final = reflect.applyHitcaps(slam2Reflect, state.hitcaps);
  
  return {
    primary: slam1Final,
    secondary: slam2Final
  };
}

/**
 * Calculate smoke reflect damage (from Python calcSmokeReflect)
 */
export function calcSmokeReflect(state) {
  const params = getCommonParams(state);
  const smokeResult = damage.smoke(state.enrage, state.smoke, state.infernus);
  
  // Get pad6 effects for reflect multiplier
  const pad6Effects = pads.pad6eff(state.pad6, state.maxhp, state.currenthp);
  const pad6Stacks = 1 + pad6Effects.dmgBonus / 100;
  
  // Check for DTB
  const dtbEquipCheck = state.gloves === "Deathtouch bracelet";
  
  // Adjust disintegrate mods for flames
  const flamesCadeDR = damage.disintegrateMod(100, state.pad4, smokeResult.effectiveStacks);
  const flamesDebilDR = damage.disintegrateMod(50, state.pad4, smokeResult.effectiveStacks);
  const flamesSdDR = damage.disintegrateMod(state.sd, state.pad4, smokeResult.effectiveStacks);
  const flamesDisruptDR = flamesCadeDR;
  const flamesReflectDR = flamesDebilDR;
  const flamesResDR = flamesCadeDR;
  
  const smokeReflect = reflect.reflectCalculation(
    smokeResult.damage,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, flamesCadeDR, flamesDebilDR, state.absorb, flamesSdDR, state.emerald,
    flamesDisruptDR, 0, flamesReflectDR, flamesResDR, params.armorDR,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  // Apply hitcaps
  const smokeFinal = reflect.applyHitcaps(smokeReflect, state.hitcaps);
  
  return smokeFinal;
}

/**
 * Calculate decimation reflect damage (from Python calcDecimationReflect)
 */
export function calcDecimationReflect(state, releaseTick = null) {
  const params = getCommonParams(state);
  const tick = releaseTick || state.decimation;
  const decimationBase = damage.decimation(state.enrage, tick);
  
  // Get pad6 effects for reflect multiplier
  const pad6Effects = pads.pad6eff(state.pad6, state.maxhp, state.currenthp);
  const pad6Stacks = 1 + pad6Effects.dmgBonus / 100;
  
  // Check for DTB
  const dtbEquipCheck = state.gloves === "Deathtouch bracelet";
  
  const cadeDR = damage.disintegrateMod(100, state.pad4, 0, 40);
  const debilDR = damage.disintegrateMod(50, state.pad4, 0, 40);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4, 0, 40);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  const decimationReflect = reflect.reflectCalculation(
    decimationBase,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR, params.armorDR,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  // Apply hitcaps
  const decimationFinal = reflect.applyHitcaps(decimationReflect, state.hitcaps);
  
  return decimationFinal;
}

/**
 * Calculate cage reflect damage (from Python calcCageReflect)
 */
export function calcCageReflect(state) {
  const params = getCommonParams(state);
  const cageBase = damage.cage(state.enrage, state.teamsize, state.totg);
  
  // Get pad6 effects for reflect multiplier
  const pad6Effects = pads.pad6eff(state.pad6, state.maxhp, state.currenthp);
  const pad6Stacks = 1 + pad6Effects.dmgBonus / 100;
  
  // Check for DTB
  const dtbEquipCheck = state.gloves === "Deathtouch bracelet";
  
  const cageReflect = reflect.reflectCalculation(
    cageBase,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, state.deflect,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, true, state.dw, state.hh, state.phantom, state.ad,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, params.cageDR, params.reflectDR, params.resDR, params.armorDR,
    params.cryptMagic, params.abilityDamage, params.adDR,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  // Apply hitcaps
  const cageFinal = reflect.applyHitcaps(cageReflect, state.hitcaps);
  
  return cageFinal;
}

/**
 * Calculate big bomb reflect damage (from Python calcBigBombReflect)
 */
export function calcBigBombReflect(state) {
  const params = getCommonParams(state);
  const p7Result = p7.p7(state.mode, state.enrage, state);
  
  // Get pad6 effects for reflect multiplier
  const pad6Effects = pads.pad6eff(state.pad6, state.maxhp, state.currenthp);
  const pad6Stacks = 1 + pad6Effects.dmgBonus / 100;
  
  // Check for DTB
  const dtbEquipCheck = state.gloves === "Deathtouch bracelet";
  
  const bigBomb = p7Result.red_bar;
  const bigBombMax = bigBomb * 1.1;
  const bigBombAvg = bigBomb * 1.05;
  
  const cadeDR = damage.disintegrateMod(100, state.pad4, 0, 50);
  const debilDR = damage.disintegrateMod(50, state.pad4, 0, 50);
  const sdDR = damage.disintegrateMod(state.sd, state.pad4, 0, 50);
  const disruptDR = cadeDR;
  const reflectDR = debilDR;
  const resDR = cadeDR;
  
  const bigMaxReflect = reflect.reflectCalculation(
    bigBombMax,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR, 1,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const bigMinReflect = reflect.reflectCalculation(
    bigBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR, 1,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const bigAvgReflect = reflect.reflectCalculation(
    bigBombAvg,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, cadeDR, debilDR, state.absorb, sdDR, state.emerald,
    disruptDR, 0, reflectDR, resDR, 1,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  // Apply hitcaps
  const bigMaxFinal = reflect.applyHitcaps(bigMaxReflect, state.hitcaps);
  const bigMinFinal = reflect.applyHitcaps(bigMinReflect, state.hitcaps);
  const bigAvgFinal = reflect.applyHitcaps(bigAvgReflect, state.hitcaps);
  
  return {
    max: bigMaxFinal,
    min: bigMinFinal,
    avg: bigAvgFinal
  };
}

/**
 * Calculate small bomb reflect damage (from Python calcSmallBombReflect)
 */
export function calcSmallBombReflect(state) {
  const params = getCommonParams(state);
  const p7Result = p7.p7(state.mode, state.enrage, state);
  
  // Get pad6 effects for reflect multiplier
  const pad6Effects = pads.pad6eff(state.pad6, state.maxhp, state.currenthp);
  const pad6Stacks = 1 + pad6Effects.dmgBonus / 100;
  
  // Check for DTB
  const dtbEquipCheck = state.gloves === "Deathtouch bracelet";
  
  const smallBomb = p7Result.small_bombs;
  const smallTsBomb = pfloor((smallBomb * state.pad1) / 10);
  
  const smallReflect = reflect.reflectCalculation(
    smallBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, 0, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  const smallTsReflect = reflect.reflectCalculation(
    smallTsBomb,
    state.pulv, state.cade, state.debil, params.zerkAuraCheck, state.sever, state.enfeeble,
    state.anchor, state.darklight, params.aegisCheck, true, state.disr, state.pad3, state.pad5, false,
    state.anti, state.refl, state.darkness, state.divert, state.immort, state.zerk,
    state.ful, true, params.spiritCheck, false, state.dw, state.hh, false, false,
    1, params.cadeDR, params.debilDR, state.absorb, params.sdDR, state.emerald,
    params.disruptDR, 0, params.reflectDR, params.resDR, params.armorDR,
    1, params.abilityDamage, 0,
    state.ppoints, state.powder, state.currenthp, state.maxhp,
    state.vuln, state.croe, pad6Stacks, state.veng_check, dtbEquipCheck,
    state.defl_check, state.gloves
  );
  
  // Apply hitcaps
  const smallFinal = reflect.applyHitcaps(smallReflect, state.hitcaps);
  const smallTsFinal = reflect.applyHitcaps(smallTsReflect, state.hitcaps);
  
  return {
    normal: smallFinal,
    twinshot: smallTsFinal
  };
}

// Note: Similar functions for range autos reflect, slam reflect, smoke reflect, etc.
// Would follow the same pattern as mage autos reflect.

// ============ Complete All Calculations ============

/**
 * Calculate everything at once (main function)
 */
export function calculateAll(state) {
  return {
    // HP Scaling
    hp: hp.phaseHp(state.enrage, state.teamsize),
    
    // Pad Effects
    pads: {
      pad1: pads.pad1eff(state.adren, state.pad1),
      pad2: pads.pad2eff(state.pad2, state.cooldown, state.maxhp, state.fort),
      pad4: pads.pad4eff(state.disint_dr, state.pad4, state.spec, state.disint_smoke, state.disint_infernus),
      pad6: pads.pad6eff(state.pad6, state.maxhp, state.currenthp)
    },
    
    // P7 Info
    p7: p7.p7(state.mode, state.enrage, state),
    chargeInfo: p7.chargeCalcs(state.enrage),
    
    // Damage Calculations
    mageAutos: calcMageAutos(state),
    rangeAutos: calcRangeAutos(state),
    slam: calcSlam(state),
    infernus: calcInfernus(state),
    smoke: calcSmoke(state),
    decimation: calcDecimation(state),
    tomb: calcDecimation(state, state.tomb),
    cage: calcCage(state),
    bigBomb: calcBigBomb(state),
    smallBomb: calcSmallBomb(state),
    
    // Divert Calculations (if divert is selected)
    mageDivert: state.divert_res_check === "Divert" ? calcMageAutosDivert(state) : state.divert_res_check === "Resonance" ? calcMageAutosHealing(state) : null,
    rangeDivert: state.divert_res_check === "Divert" ? calcRangeAutosDivert(state) : state.divert_res_check === "Resonance" ? calcRangeAutosHealing(state) : null,
    slamDivert: state.divert_res_check === "Divert" ? calcSlamDivert(state) : state.divert_res_check === "Resonance" ? calcSlamHealing(state) : null,
    smokeDivert: state.divert_res_check === "Divert" ? calcSmokeDivert(state) : state.divert_res_check === "Resonance" ? calcSmokeHealing(state) : null,
    tombDivert: state.divert_res_check === "Divert" ? calcDecimationDivert(state, state.tomb) : state.divert_res_check === "Resonance" ? calcDecimationHealing(state, state.tomb) : null,
    decimationDivert: state.divert_res_check === "Divert" ? calcDecimationDivert(state) : state.divert_res_check === "Resonance" ? calcDecimationHealing(state) : null,
    cageDivert: state.divert_res_check === "Divert" ? calcCageDivert(state) : state.divert_res_check === "Resonance" ? calcCageHealing(state) : null,
    bigBombDivert: state.divert_res_check === "Divert" ? calcBigBombDivert(state) : state.divert_res_check === "Resonance" ? calcBigBombHealing(state) : null,
    smallBombDivert: state.divert_res_check === "Divert" ? calcSmallBombDivert(state) : state.divert_res_check === "Resonance" ? calcSmallBombHealing(state) : null,
    
    // Reflect Calculations
    mageReflect: calcMageAutosReflect(state),
    rangeReflect: calcRangeAutosReflect(state),
    slamReflect: calcSlamReflect(state),
    smokeReflect: calcSmokeReflect(state),
    decimationReflect: calcDecimationReflect(state),
    tombReflect: calcDecimationReflect(state, state.tomb),
    cageReflect: calcCageReflect(state),
    bigBombReflect: calcBigBombReflect(state),
    smallBombReflect: calcSmallBombReflect(state),
  };
}

// /**
//  * Get calculation based on divert mode
//  */
// export function getHealingOrDivert(state, calculationType) {
//   if (state.divert_res_check === "Divert") {
//     return calculationType === "mage" ? calcMageAutosDivert(state) :
//            calculationType === "range" ? calcMageAutosDivert(state) :
//            null; // Add more as needed
//   } else if (state.divert_res_check === "Resonance") {
//     return calculationType === "mage" ? calcMageAutosHealing(state) :
//            calculationType === "range" ? calcRangeAutosHealing(state) :
//            null; // Add more as needed
//   }
//   return null;
// }

// Export all calculation functions
export default {
  // Core calculations
  calculateAll,
  
  // Individual calculations
  calcMageAutos,
  calcRangeAutos,
  calcSlam,
  calcInfernus,
  calcSmoke,
  calcDecimation,
  calcCage,
  calcBigBomb,
  calcSmallBomb,
  
  // Healing calculations
  calcMageAutosHealing,
  calcRangeAutosHealing,
  calcSlamHealing,
  calcSmokeHealing,
  calcDecimationHealing,
  calcCageHealing,
  calcBigBombHealing,
  calcSmallBombHealing,
  
  // Divert calculations
  calcMageAutosDivert,
  calcRangeAutosDivert,
  calcSlamDivert,
  calcSmokeDivert,
  calcDecimationDivert,
  calcCageDivert,
  calcBigBombDivert,
  calcSmallBombDivert,
  
  // Reflect calculations
  calcMageAutosReflect,
  calcRangeAutosReflect,
  calcSlamReflect,
  calcSmokeReflect,
  calcDecimationReflect,
  calcCageReflect,
  calcBigBombReflect,
  calcSmallBombReflect,
  
  
  // Re-exports from modules
  armor,
  damage,
  healing,
  p7,
  hp,
  pads,
  reflect
};