// Mathematical calculations translated from Python
import { CONSTANTS } from './constants.js';

// Global variables storage (similar to Python's settings.py)
export let variables = {
    // Zamorak settings
    enrage: 4000,
    pad1: 0,
    pad2: 0,
    pad3: false,
    pad4: 0,
    pad5: false,
    pad6: 0,
    choke: 1,
    slam: 3,
    smoke: 4,
    infernus: false,
    tomb: 1,
    decimation: 30,
    grey: false,
    aggro: true,
    mode: "Charge value",
    charge_input: 0,
    iteration_input: 0,
    red_input: 0,
    
    // Player settings
    helm: "Cryptbloom",
    top: "Cryptbloom",
    bottoms: "Cryptbloom",
    gloves: "Cryptbloom",
    boots: "Cryptbloom",
    shield: "Spirit",
    eof: true,
    ovl: "Elder overload",
    def: 99,
    powder: true,
    ppoints: 990,
    affliction: 18,
    desolation: 0,
    maxhp: 13537,
    currenthp: 13537,
    boneshield: 60,
    totg: true,
    puzzlebox: true,
    
    // Ability damage
    abilDamageMode: "Total value",
    abilDamage: 2425,
    eruptive: "2",
    ring: "+30.4",
    pocket: "+8",
    necklace: "+59",
    reaperCrew: true,
    eqAura: true,
    weaponTier: 95,
    NecroLvl: 145,
    
    // Damage modifiers
    disr: false,
    cade: false,
    divert_res_check: "None",
    refl: false,
    debil: false,
    sd: 0,
    immort: false,
    anti: false,
    ful: false,
    aura: "None",
    zerk: false,
    pulv: false,
    sever: false,
    absorb: 0,
    enfeeble: false,
    emerald: 0,
    anchor: false,
    darkness: false,
    deflect: true,
    fort: false,
    dw: false,
    hh: false,
    phantom: false,
    ad: true,
    
    // Reflect settings
    hitcaps: "Grey Hp",
    vuln: true,
    croe: false,
    veng_check: false,
    defl_check: false,
    dtb_check: false,
    
    // Misc
    teamsize: 2,
    adren: 9,
    cooldown: 17,
    disint_dr: 50,
    spec: "P7 Bomb",
    disint_smoke: 4,
    disint_infernus: false
};

// Save/Load functions
export function saveSettings() {
    localStorage.setItem('zamorak_calculator_settings', JSON.stringify(variables));
}

export function loadSettings() {
    const saved = localStorage.getItem('zamorak_calculator_settings');
    if (saved) {
        Object.assign(variables, JSON.parse(saved));
    }
}

// Armor calculations
export function getTier(gear) {
    const tierMap = {
        "Cryptbloom": 90, "Achto (mage)": 90, "Achto (non mage)": 90,
        "Deathwarden": 90, "T90": 90, "Sub. Ports": 85,
        "Ganodermic": 70, "Spirit": 75, "T90 defender": 45
    };
    return tierMap[gear] || 0;
}

export function getBaseArmor(tier) {
    return tier > 0 ? (Math.pow(tier, 3) / 500 + (10 * tier) + 100) : 0;
}

export function armorReduction(helm, top, bottom, gloves, boots, shield, fortCheck, defLvl) {
    const gear = [helm, top, bottom, gloves, boots];
    let reduction = 0;
    
    gear.forEach(piece => reduction += getTier(piece) * 0.0002);
    reduction += getTier(shield) * 0.001;
    reduction += defLvl / 1000;
    if (fortCheck) reduction += 0.03;
    
    return 1 - reduction;
}

export function animateDead(helm, top, bottom, gloves, boots, shield, ovl, aura, defLvl = 99) {
    const helmArmor = getBaseArmor(getTier(helm)) * 0.2;
    const topArmor = getBaseArmor(getTier(top)) * 0.23;
    const bottomArmor = getBaseArmor(getTier(bottom)) * 0.22;
    const glovesArmor = getBaseArmor(getTier(gloves)) * 0.05;
    const bootsArmor = getBaseArmor(getTier(boots)) * 0.05;
    const shieldArmor = getBaseArmor(getTier(shield)) * 0.2;
    
    const gearArmor = [helmArmor, topArmor, bottomArmor, glovesArmor, bootsArmor, shieldArmor];
    
    let adjustedDef = defLvl;
    if (aura === "Zerk aura") adjustedDef = Math.floor(defLvl * 0.85);
    if (ovl === "Elder overload") adjustedDef += 21;
    
    let sumRed = 0;
    let sumDefRed = 0;
    
    gearArmor.forEach(pieceArmor => {
        const pieceRed = pieceArmor * 0.1;
        sumRed += pieceRed;
        const defReduction = pieceRed > 0 ? Math.floor(adjustedDef / 4) : 0;
        sumDefRed += defReduction;
    });
    
    return Math.floor(sumRed) + sumDefRed;
}

// Damage calculation core
export function damageCalculation(base, modifiers, resistances) {
    // This is a simplified version - you'll need to expand based on your full logic
    let damage = base;
    
    // Apply each modifier in order (similar to Python chain)
    if (modifiers.curseDR) damage *= (1 - modifiers.curseDR/100);
    if (modifiers.pulv) damage *= 0.75;
    if (modifiers.cade) damage *= (1 - modifiers.cadeDR);
    // ... continue with all modifiers
    
    return Math.floor(damage);
}

// Phase HP calculations
export function phaseHp(enrage, teamSize) {
    const totalHp = Math.floor(teamSize * Math.min(300000 + (7500 * enrage) / 10, 1600000));
    const p1Hp = totalHp;
    const p2Hp = Math.floor(totalHp * 0.84);
    const p3Hp = Math.floor(totalHp * 0.68);
    const p4Hp = Math.floor(totalHp * 0.52);
    const p5Hp = Math.floor(totalHp * 0.36);
    const p6Hp = Math.floor(totalHp * 0.2);
    
    let p7Hp = 0;
    if (enrage >= 100) {
        p7Hp = Math.floor(1000 * teamSize * (100 + (Math.min(Math.max(enrage, 100), 1000) - 100) / 6));
    }
    
    const grey = Math.floor(teamSize * (75000 + Math.min(enrage, 750) * 100));
    const witch = Math.floor(33000 + (enrage * 13.2));
    const demon = Math.min(Math.floor(15000 + enrage * 37.5), 70000);
    const rune = teamSize === 1 ? 
        Math.floor((25000 + (Math.min(Math.max(enrage, 1000), 3500) * 10)) / 2) :
        Math.floor(25000 + (Math.min(Math.max(enrage, 1000), 3500) * 10));
    
    return { p1Hp, p2Hp, p3Hp, p4Hp, p5Hp, p6Hp, p7Hp, grey, witch, demon, rune };
}

// P7 calculations
export function redBar(charge_start, charge_rate, iteration) {
    let charge = charge_start;
    let red_bar = 0;
    for (let i = 0; i < iteration; i++) {
        charge += charge_rate;
        red_bar += Math.floor(charge);
    }
    return Math.min(red_bar, 100000);
}

export function smallBombs(red_bar, iteration) {
    return Math.floor((red_bar / 100) * iteration);
}

export function calculateP7(mode, enrage, inputs) {
    if (mode === "Iteration") {
        const iteration = Math.min(inputs.iteration_input, 500);
        const charge_start = Math.min(250 + (enrage / 5 - 20), 2000);
        const charge_rate = charge_start / 100;
        
        const red_bar = redBar(charge_start, charge_rate, iteration);
        const small_bombs = smallBombs(red_bar, iteration);
        
        return { red_bar, small_bombs, iteration };
    }
    // Add other modes...
    
    return { red_bar: 0, small_bombs: 0, iteration: 0 };
}

// Pad effects
export function pad1eff(adren, stacks) {
    const gain = adren + 0.2 * adren * stacks;
    const dmg = stacks * 10;
    return { gain, dmg };
}

export function pad2eff(stacks, cd, maxHp, fortCheck) {
    const cdr = stacks * 8 * 0.01;
    const finalCdTicks = Math.floor(cd * (1 - cdr));
    const finalCdSec = Math.round(finalCdTicks * 0.6 * 10) / 10;
    const thresh = Math.floor(99 * 100 * 0.05 * stacks);
    const effHp = maxHp - thresh + (fortCheck ? 1000 : 0);
    
    return { finalCdTicks, finalCdSec, thresh, effHp };
}

// Add to calculations.js

export function pad4eff(dr, disint, spec, smoke = 0, infernus = false) {
    if (spec === "P7 Bomb") {
        const b = 50;
        smoke = 0;
    } else if (spec === "Decimation") {
        const b = 40;
        smoke = 0;
    } else if (spec === "Smoke") {
        const b = 0;
        if (infernus) {
            smoke = smoke * 3;
        }
    } else {
        const b = 0;
        smoke = 0;
    }
    
    const effectiveness = Math.floor(100 - disintegrateMod(dr, disintegrate = disint, flames = smoke, base = b) * 100);
    return effectiveness;
}

export function pad6eff(stacks, maxHp, currentHp) {
    const hpNeeded = Math.floor(maxHp * 0.6);
    let dmgBonus = 0;
    if (currentHp / maxHp < 0.6) {
        dmgBonus = stacks * 6;
    }
    const healingReduction = stacks * 10;
    return { hpNeeded, dmgBonus, healingReduction };
}

// Helper function for disintegrate modifier
function disintegrateMod(defValue, disintegrate = 0, flames = 0, base = 0) {
    return (Math.floor(defValue * (disintegrate * 0.07 + flames * 0.01 + base / 100)) + (100 - defValue)) / 100;
}

// Auto attacks calculation
export function autos(enrage, twinshot, greyCheck, aggroCheck, questCheck) {
    let dmg = CONSTANTS.autos_base;
    const scaling = CONSTANTS.autos_scaling;
    
    let maxDmg = dmg + scaling * enrage;
    let minDmg = maxDmg * 0.7;
    
    if (!greyCheck) {
        maxDmg = Math.floor(maxDmg / 1.5);
        minDmg = Math.floor(minDmg / 1.5);
    }
    
    if (!aggroCheck) {
        maxDmg = Math.floor(maxDmg * 0.75);
        minDmg = Math.floor(minDmg * 0.75);
    }
    
    if (questCheck) {
        maxDmg = Math.floor(maxDmg * 0.9);
        minDmg = Math.floor(minDmg * 0.9);
    }
    
    const TS = Math.floor((maxDmg * twinshot) / 10);
    
    return { maxDmg, minDmg, TS };
}

// Main calculation functions
export function calcMageAutos() {
    const { maxDmg, minDmg, TS } = autos(
        variables.enrage,
        variables.pad1,
        variables.grey,
        variables.aggro,
        variables.totg
    );
    
    // Simplified - expand with full calculation chain
    const maxFinal = Math.floor(maxDmg * 0.5); // Placeholder
    const minFinal = Math.floor(minDmg * 0.5);
    const avgFinal = Math.floor((maxDmg + minDmg) / 2 * 0.5);
    const tsFinal = Math.floor(TS * 0.5);
    
    return { maxFinal, minFinal, avgFinal, tsFinal };
}

export function calcRangeAutos() {
    const { maxDmg, minDmg, TS } = autos(
        variables.enrage,
        variables.pad1,
        variables.grey,
        variables.aggro,
        variables.totg
    );
    
    // Similar to mage but with range-specific modifiers
    const maxFinal = Math.floor(maxDmg * 0.55);
    const minFinal = Math.floor(minDmg * 0.55);
    const avgFinal = Math.floor((maxDmg + minDmg) / 2 * 0.55);
    const tsFinal = Math.floor(TS * 0.55);
    
    return { maxFinal, minFinal, avgFinal, tsFinal };
}

export function calcSlam() {
    // Placeholder - implement based on Python logic
    const base1 = 10000;
    const base2 = 5000;
    
    return { base1, base2 };
}

// Update all calculations
export function updateAllCalculations() {
    const hpScaling = phaseHp(variables.enrage, variables.teamsize);
    const mageAutos = calcMageAutos();
    const rangeAutos = calcRangeAutos();
    const slam = calcSlam();
    
    // Pad effects
    const pad1 = pad1eff(variables.adren, variables.pad1);
    const pad2 = pad2eff(variables.pad2, variables.cooldown, variables.maxhp, variables.fort);
    const pad4 = pad4eff(
        variables.disint_dr,
        variables.pad4,
        variables.spec,
        variables.disint_smoke,
        variables.disint_infernus
    );
    const pad6 = pad6eff(variables.pad6, variables.maxhp, variables.currenthp);
    
    return {
        hpScaling,
        mageAutos,
        rangeAutos,
        slam,
        pad1,
        pad2,
        pad4,
        pad6,
        // P7 calculations if needed
        p7: calculateP7(variables.mode, variables.enrage, {
            iteration_input: variables.iteration_input,
            charge_input: variables.charge_input,
            red_input: variables.red_input
        })
    };
}

