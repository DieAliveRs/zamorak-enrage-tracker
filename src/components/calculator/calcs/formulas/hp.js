// src/components/calculator/calcs/formulas/hp.js

import { pfloor, pmin, pmax } from './damage.js';
import { MAX_LIMITS } from '../constants.js';

/**
 * Phase HP scaling (from Python phaseHp)
 */
export function phaseHp(enrage, teamSize) {
  const totalHp = pfloor(teamSize * (pmin(300000 + (7500 * enrage) / 10, MAX_LIMITS.TOTAL_HP_MAX)));
  
  const p1Hp = totalHp;
  const p2Hp = pfloor(totalHp * 0.84);
  const p3Hp = pfloor(totalHp * 0.68);
  const p4Hp = pfloor(totalHp * 0.52);
  const p5Hp = pfloor(totalHp * 0.36);
  const p6Hp = pfloor(totalHp * 0.2);
  
  let p7Hp;
  if (enrage >= 100) {
    p7Hp = pfloor(1000 * teamSize * (100 + (pmax(pmin(enrage, 1000), 100) - 100) / 6));
  } else {
    p7Hp = 0;
  }
  
  const grey = pfloor(teamSize * (75000 + pmin(enrage, 750) * 100));
  const witch = pfloor(33000 + (enrage * 13.2));
  const demon = pmin(pfloor(15000 + enrage * 37.5), MAX_LIMITS.DEMON_HP_MAX);
  
  let rune;
  if (teamSize === 1) {
    rune = pfloor(pfloor(25000 + (pmax(pmin(enrage, 3500), 1000) * 10)) / 2);
  } else {
    rune = pfloor(25000 + (pmax(pmin(enrage, 3500), 1000) * 10));
  }
  
  return {
    p1Hp, p2Hp, p3Hp, p4Hp, p5Hp, p6Hp, p7Hp,
    grey, witch, demon, rune
  };
}