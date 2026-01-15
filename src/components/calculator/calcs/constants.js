// src/components/calculator/calcs/constants.js

// Auto attack constants
export const AUTOS_BASE = 1910;      // Python: c.autos_base
export const AUTOS_SCALING = 5.454;   // Python: c.autos_scaling

// Infernus constants
export const INFERNUS_BASE = 300;   // Python: c.infernus_base
export const INFERNUS_SCALING = 45; // Python: c.infernus_scaling

// Smoke constants
export const SMOKE_BASE = 700;      // Python: c.smoke_base
export const SMOKE_SCALING = 2;  // Python: c.smoke_scaling

// Slam constants
export const SLAM_BASE = 8400;      // Python: c.slam_base
export const SLAM_ENRAGE_SCALING = 24; // Python: c.slam_enrage_scaling
export const SLAM_DISTANCE_SCALING = 0.05; // Python: c.slam_distance_scaling

// Decimation constants
export const DECIMATION_BASE = 16800; // Python: c.decimation_base
export const DECIMATION_ENRAGE_SCALING = 48; // Python: c.decimation_enrage_scaling
export const DECIMATION_TICK_SCALING = 1/30; // Python: c.decimation_tick_scaling

// Cage constants
export const CAGE_BASE = 1500;      // Python: c.cage_base
export const CAGE_SCALING = 1.5;   // Python: c.cage_scaling

// Gear tier bonuses (from ability damage calc)
export const T95_BONUSES = {
  helm: 25,
  top: 37,
  bottoms: 32,
  gloves: 16,
  boots: 16
};

export const T90_BONUSES = {
  helm: 23.2,
  top: 34.8,
  bottoms: 29,
  gloves: 14.5,
  boots: 14.5
};

// Protection prayer reductions
export const PROTECTION_REDUCTIONS = {
  autos: 0.6,
  twinshot: 0.5,
  slam: 0.5,
  cage: {
    0: 0.5,    // enrage < 500
    500: 0.4,  // enrage < 800  
    800: 0.35, // enrage < 1100
    1100: 0.3  // enrage >= 1100
  }
};

// Cryptbloom modifiers
export const CRYPTBLOOM_MODS = {
  2: { melee: 0.08, magic: 0.12 },
  3: { melee: 0.12, magic: 0.18 },
  default: { melee: 0, magic: 0 }
};

// Maximum limits
export const MAX_LIMITS = {
  ENRAGE: 4000,
  ITERATION: 500,
  RED_BAR: 100000,
  CHARGE_START_MAX: 2000,
  CAGE_MAX: 32500,
  SLAM_MAX: 35000,
  TOTAL_HP_MAX: 1600000,
  DEMON_HP_MAX: 70000,
  ADREN_BLOCK_MAX: 12000
};

// Damage hitcaps
export const HITCAPS = {
  GREY: 32500,
  GREEN: 30000,
  VENG: 8000
};