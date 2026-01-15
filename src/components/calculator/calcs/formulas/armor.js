// src/components/calculator/calcs/formulas/armor.js

import { T95_BONUSES, T90_BONUSES } from '../constants.js';

// ============ Armor Tier Functions ============

/**
 * Get tier from gear name (from Python getTier function)
 */
export function getTier(gear) {
  const tierMap = {
    "Cryptbloom": 90,
    "Achto (mage)": 90,
    "Achto (non mage)": 90,
    "Deathwarden": 90,
    "T90": 90,
    "Sub. Ports": 85,
    "Ganodermic": 70,
    "Spirit": 75,
    "T90 defender": 45
  };
  
  return tierMap[gear] || 0;
}

/**
 * Get base armor value (from Python getBaseArmor)
 */
export function getBaseArmor(tier) {
  if (tier <= 0) return 0;
  return Math.pow(tier, 3) / 500 + (10 * tier) + 100;
}

/**
 * Calculate armor damage reduction (from Python armorReduction)
 */
export function armorReduction(helm, top, bottom, gloves, boots, shield, fortCheck, defLvl) {
  const gear = [helm, top, bottom, gloves, boots];
  
  let reduction = 0;
  
  // Add gear contributions
  gear.forEach(piece => {
    reduction += getTier(piece) * 0.0002;
  });
  
  // Add shield contribution
  reduction += getTier(shield) * 0.001;
  
  // Add defense level contribution
  reduction += defLvl / 1000;
  
  // Add Fortitude prayer if active
  if (fortCheck) {
    reduction += 0.03;
  }
  
  // Return damage multiplier (1 - reduction)
  return 1 - reduction;
}

/**
 * Calculate Animate Dead reduction (from Python animateDead)
 */
export function animateDead(helm, top, bottom, gloves, boots, shield, ovl, aura, defLvl = 99) {
  // Calculate armor contributions for each piece
  const helmArmor = getBaseArmor(getTier(helm)) * 0.2;
  const topArmor = getBaseArmor(getTier(top)) * 0.23;
  const bottomArmor = getBaseArmor(getTier(bottom)) * 0.22;
  const glovesArmor = getBaseArmor(getTier(gloves)) * 0.05;
  const bootsArmor = getBaseArmor(getTier(boots)) * 0.05;
  const shieldArmor = getBaseArmor(getTier(shield)) * 0.2;
  
  const gearArmor = [helmArmor, topArmor, bottomArmor, glovesArmor, bootsArmor, shieldArmor];
  
  // Adjust defense level based on aura and overload
  let adjustedDefLvl = defLvl;
  
  if (aura === "Zerk aura") {
    adjustedDefLvl = Math.floor(adjustedDefLvl * 0.85);
  }
  
  if (ovl === "Elder overload") {
    adjustedDefLvl += 21;
  }
  
  // Calculate reduction
  let sumRed = 0;
  let sumDefRed = 0;
  
  gearArmor.forEach(pieceArmor => {
    const pieceRed = pieceArmor * 0.1;
    sumRed += pieceRed;
    
    if (pieceRed > 0) {
      const defReduction = Math.floor(adjustedDefLvl / 4);
      sumDefRed += defReduction;
    }
  });
  
  return Math.floor(sumRed) + sumDefRed;
}

/**
 * Calculate Cryptbloom modifiers (from Python cryptMod)
 */
export function cryptMod(helm, top, bottom, gloves, boots) {
  const gear = [helm, top, bottom, gloves, boots];
  
  let pieceCount = 0;
  gear.forEach(piece => {
    if (piece === "Cryptbloom") {
      pieceCount++;
    }
  });
  
  if (pieceCount === 2) {
    return { meleeMod: 1 - 0.08, magicMod: 1 - 0.12 };
  } else if (pieceCount > 2) {
    return { meleeMod: 1 - 0.12, magicMod: 1 - 0.18 };
  } else {
    return { meleeMod: 1, magicMod: 1 };
  }
}

/**
 * Calculate ability damage (from Python abilDamageMode)
 */
export function abilDamageMode(mode, variables) {
  if (mode === "Total value") {
    return variables.abilDamage;
  }
  
  if (mode === "Ability damage calc") {
    const eruptive = 0.005 * parseInt(variables.eruptive);
    const ring = variables.ring !== "None" ? parseFloat(variables.ring.slice(1)) : 0;
    const pocket = variables.pocket !== "None" ? parseFloat(variables.pocket.slice(1)) : 0;
    const necklace = variables.necklace !== "None" ? parseFloat(variables.necklace.slice(1)) : 0;
    const reaperCrew = variables.reaperCrew ? 12 : 0;
    const eqAura = variables.eqAura ? 0.12 : 0;
    const weaponTier = parseFloat(variables.weaponTier);
    const NecroLvl = parseInt(variables.NecroLvl);
    
    // Add gear bonuses
    let bonusAD = 0;
    const gear = ["helm", "top", "bottoms", "gloves", "boots"];
    
    gear.forEach((item, i) => {
      if (variables[item] === "TFN") {
        bonusAD += T95_BONUSES[item];
      } else if (variables[item] === "Deathdealer t90") {
        bonusAD += T90_BONUSES[item];
      }
    });
    
    bonusAD += ring + pocket + necklace + reaperCrew;
    
    // Calculate mainhand and offhand ability damage
    const ADmh = Math.floor(2.5 * NecroLvl) + Math.floor(9.6 * weaponTier + bonusAD);
    const ADoh = Math.floor(0.5 * (Math.floor(2.5 * NecroLvl) + Math.floor(9.6 * weaponTier + bonusAD)));
    
    // Final ability damage with modifiers
    const finalAD = Math.floor((ADmh + ADoh) * (1 + eruptive + eqAura));
    
    return finalAD;
  }
  
  return 0;
}