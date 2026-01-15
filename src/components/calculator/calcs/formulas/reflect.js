// src/components/calculator/calcs/formulas/reflect.js

import { damageCalculation, dmgMod, dmgMod2, pfloor, spiritMod, deathwardMod, phantomMod,adMod } from './damage.js';
import { HITCAPS } from '../constants.js';

/**
 * Reflect damage calculation (from Python reflectCalculation)
 */
export function reflectCalculation(
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
  pp, powderCheck, currentHp, maxHp,
  // Reflect-specific
  vulnCheck, croeCheck, pad6Stacks, vengCheck, dtbCheck,
  // Additional checks
  defl_check, gloves
) {
  // Calculate base damage taken
  // const damageTaken = damageCalculation(
  //   base,
  //   pulvCheck, cadeCheck, debilCheck, zerkAuraCheck, severCheck, enfeebleCheck,
  //   anchorCheck, aegisCheck, sdCheck, disruptCheck, pad3Check, pad5Check,
  //   prayerCheck, anticipCheck, reflectCheck, darknessCheck, resCheck,
  //   immortCheck, zerkUltCheck, fulBookCheck, armorCheck, spiritCheck,
  //   cryptCheck, deathwardCheck, hhCheck, phantomCheck, adCheck,
  //   curseDR, cadeDR, debilDR, absorbStacks, sdDR, emeraldStacks, disruptDR,
  //   prayerDR, reflectDR, resDR, armorDR, cryptDR, abilDamage, adDR,
  //   pp, powderCheck, currentHp, maxHp
  // );

  let damage = base;
  let pad5 = 0;
  let anticip = 0;
  let darkness = 0;
  let immort = 0;
  let ad = 0;
    
  damage = dmgMod(true, damage, curseDR); // curseDR = 1 - curseStacks/100
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
  pad5 = dmgMod(pad5Check, damage, 0.95);
  anticip = dmgMod(prayerCheck, pad5, prayerDR);
  damage = dmgMod(anticipCheck, anticip, 0.9);
  damage = dmgMod(reflectCheck, damage, reflectDR);
  darkness = dmgMod(darknessCheck, damage, 0.75);
  damage = dmgMod(resCheck, darkness, resDR);
  immort = dmgMod(immortCheck, damage, 0.75);
  damage = dmgMod(zerkUltCheck, immort, 1.5);
  damage = dmgMod(fulBookCheck, damage, 1.1);
  damage = dmgMod(armorCheck, damage, armorDR);
  damage = spiritMod(spiritCheck, damage, 0.3, pp, powderCheck);
  damage = dmgMod(cryptCheck, damage, cryptDR);
  damage = deathwardMod(deathwardCheck, damage, currentHp, maxHp);
  damage = dmgMod(hhCheck, damage, 0.8);
  damage = phantomMod(phantomCheck, damage, abilDamage);
  ad = adMod(adCheck, damage, adDR);
  
  // Initialize reflect damages
  let reflFinal = 0;
  let deflFinal = 0;
  let darkFinal = 0;
  let vengFinal = 0;
  let dtbFinal = 0;
  
  // Calculate Reflect damage
  if (reflectCheck) {
    let reflectDmg = dmgMod2(reflectCheck, anticip, 1 - reflectDR);
    reflectDmg = dmgMod(vulnCheck, reflectDmg, 1.1);
    reflectDmg = dmgMod(croeCheck, reflectDmg, 1.1);
    reflectDmg = dmgMod(pad3Check, reflectDmg, 1.05);
    reflectDmg = dmgMod(pad5Check, reflectDmg, 0.95);
    reflectDmg = dmgMod(true, reflectDmg, pad6Stacks);
    reflFinal = pfloor(reflectDmg);
  }
  
  // Calculate Deflect damage
  if (prayerCheck && defl_check) {
    let deflectDmg = dmgMod(prayerCheck, pad5, 0.1);
    deflectDmg = dmgMod(vulnCheck, deflectDmg, 1.1);
    deflectDmg = dmgMod(croeCheck, deflectDmg, 1.1);
    deflectDmg = dmgMod(pad3Check, deflectDmg, 1.05);
    deflectDmg = dmgMod(pad5Check, deflectDmg, 0.95);
    deflectDmg = dmgMod(true, deflectDmg, pad6Stacks);
    deflFinal = pfloor(deflectDmg);
  }
  
  // Calculate Darkness damage
  if (darknessCheck) {
    let darknessDmg = dmgMod(darknessCheck, darkness, 0.25);
    darknessDmg = dmgMod(vulnCheck, darknessDmg, 1.1);
    darknessDmg = dmgMod(croeCheck, darknessDmg, 1.1);
    darknessDmg = dmgMod(pad3Check, darknessDmg, 1.05);
    darknessDmg = dmgMod(pad5Check, darknessDmg, 0.95);
    darknessDmg = dmgMod(true, darknessDmg, pad6Stacks);
    darkFinal = pfloor(darknessDmg);
  }
  
  // Calculate Vengeance damage
  if (vengCheck) {
    let vengDmg = dmgMod(vengCheck, ad, 0.75);
    vengDmg = dmgMod(vulnCheck, vengDmg, 1.1);
    vengDmg = dmgMod(croeCheck, vengDmg, 1.1);
    vengDmg = dmgMod(pad3Check, vengDmg, 1.05);
    vengDmg = dmgMod(pad5Check, vengDmg, 0.95);
    vengDmg = dmgMod(true, vengDmg, pad6Stacks);
    vengFinal = pfloor(vengDmg);
  }
  
  // Calculate Deathtouch Bracelet damage
  const dtbEquipCheck = gloves === "Deathtouch bracelet";
  if (dtbCheck && dtbEquipCheck) {
    // DTB min
    let dtbMinDmg = dmgMod(dtbCheck, immort, 0.25);
    dtbMinDmg = dmgMod(vulnCheck, dtbMinDmg, 1.1);
    dtbMinDmg = dmgMod(croeCheck, dtbMinDmg, 1.1);
    dtbMinDmg = dmgMod(pad3Check, dtbMinDmg, 1.05);
    dtbMinDmg = dmgMod(pad5Check, dtbMinDmg, 0.95);
    dtbMinDmg = dmgMod(true, dtbMinDmg, pad6Stacks);
    
    // DTB max
    let dtbMaxDmg = dmgMod(dtbCheck, immort, 0.5);
    dtbMaxDmg = dmgMod(vulnCheck, dtbMaxDmg, 1.1);
    dtbMaxDmg = dmgMod(croeCheck, dtbMaxDmg, 1.1);
    dtbMaxDmg = dmgMod(pad3Check, dtbMaxDmg, 1.05);
    dtbMaxDmg = dmgMod(pad5Check, dtbMaxDmg, 0.95);
    dtbMaxDmg = dmgMod(true, dtbMaxDmg, pad6Stacks);
    
    // DTB average
    dtbFinal = pfloor((dtbMinDmg + dtbMaxDmg) / 2);
  }
  
  return {
    refl: reflFinal,
    defl: deflFinal,
    dark: darkFinal,
    veng: vengFinal,
    dtb: dtbFinal
  };
}

/**
 * Apply hitcaps to reflect damage (from various calc*Reflect functions)
 */
export function applyHitcaps(reflectDamage, hitcapsMode) {
  const { refl, defl, dark, veng, dtb } = reflectDamage;
  
  let totalReflect = refl + defl + dark + dtb;
  let totalVeng = veng;
  
  if (hitcapsMode === "Grey Hp") {
    totalReflect = Math.min(totalReflect, HITCAPS.GREY);
    totalVeng = Math.min(totalVeng, HITCAPS.VENG);
  } else if (hitcapsMode === "Green Hp") {
    totalReflect = Math.min(totalReflect, HITCAPS.GREEN);
    totalVeng = Math.min(totalVeng, HITCAPS.VENG);
  }
  
  return pfloor(totalReflect + totalVeng);
}