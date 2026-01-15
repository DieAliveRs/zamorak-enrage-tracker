// src/components/calculator/state/storage.js

// Default values extracted from your Python startupSettings() function
export const DEFAULT_STATE = {
  // ============ Zamorak Settings ============
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
  
  // ============ Player Settings ============
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
  
  // ============ Ability Damage Settings ============
  abilDamageMode: "Total value",
  abilDamage: 2425,
  eruptive: "2",
  ring: "+30.4",
  pocket: "+8",
  necklace: "+59",
  reaperCrew: true,
  eqAura: false, // Note: false in defaults, not true
  weaponTier: 95,
  NecroLvl: 145,
  
  // ============ Damage Modifiers ============
  disr: false,
  cade: false,
  divert_res_check: "None", // Python: variables["divert_res_check"]
  divert: false, // Python: variables["divert"] (derived from above)
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
  darklight: false,
  darkness: false,
  deflect: true,
  fort: false,
  dw: false,
  hh: false,
  phantom: false,
  ad: true,
  
  // ============ Reflect Settings ============
  hitcaps: "Grey Hp",
  vuln: true,
  croe: false,
  veng_check: false,
  defl_check: false,
  dtb_check: false,
  
  // ============ Misc/Pad Effects Settings ============
  teamsize: 2,
  adren: 9,
  cooldown: "17",
  disint_dr: 50,
  spec: "P7 Bomb",
  disint_smoke: 4,
  disint_infernus: false
};

// Storage keys
const STORAGE_KEY = 'zamorak_calculator_v2';
const BACKUP_KEY = 'zamorak_calculator_backup';

export class CalculatorStorage {
  /**
   * Save state to browser cache (localStorage)
   */
  static save(state) {
    try {
      const serializable = this.prepareForStorage(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      
      // Also save a backup version
      localStorage.setItem(BACKUP_KEY, JSON.stringify(serializable));
      
      console.log('✅ Calculator settings saved to browser cache');
      return true;
    } catch (error) {
      console.warn('⚠️ Could not save to localStorage:', error);
      
      // Try sessionStorage as fallback
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch (sessionError) {
        console.error('❌ Could not save to any storage:', sessionError);
        return false;
      }
    }
  }
  
  /**
   * Load state from browser cache
   */
  static load() {
    try {
      // Try localStorage first
      let data = localStorage.getItem(STORAGE_KEY);
      
      // If not found, try backup
      if (!data) {
        data = localStorage.getItem(BACKUP_KEY);
      }
      
      // If still not found, try sessionStorage
      if (!data) {
        data = sessionStorage.getItem(STORAGE_KEY);
      }
      
      if (data) {
        const parsed = JSON.parse(data);
        return this.hydrateFromStorage(parsed);
      }
      
      console.log('📝 No saved settings found, using defaults');
      return { ...DEFAULT_STATE };
      
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      return { ...DEFAULT_STATE };
    }
  }
  
  /**
   * Clear all cached settings
   */
  static clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BACKUP_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      console.log('🧹 Calculator cache cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }
  
  /**
   * Export settings as downloadable JSON
   */
  static exportSettings(state) {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    
    return {
      url,
      filename: `zamorak-calculator-settings-${timestamp}.json`
    };
  }
  
  /**
   * Import settings from JSON file
   */
  static async importSettings(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const hydrated = this.hydrateFromStorage(data);
          
          // Save imported settings
          this.save(hydrated);
          
          resolve(hydrated);
        } catch (error) {
          reject(new Error('Invalid settings file format'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Get storage statistics
   */
  static getStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return {
        hasData: !!data,
        size: data ? new Blob([data]).size : 0,
        lastModified: data ? new Date(JSON.parse(data)._timestamp || Date.now()) : null
      };
    } catch {
      return { hasData: false, size: 0, lastModified: null };
    }
  }
  
  /**
   * Prepare state for storage (add metadata, ensure serializability)
   */
  static prepareForStorage(state) {
    return {
      ...state,
      _timestamp: Date.now(),
      _version: '2.0'
    };
  }
  
  /**
   * Hydrate state from storage (type conversions, defaults)
   */
  static hydrateFromStorage(parsed) {
    const state = { ...DEFAULT_STATE, ...parsed };
    
    // Ensure proper types (JSON stores everything as strings)
    const numberFields = [
      'enrage', 'pad1', 'pad2', 'pad4', 'pad6', 'choke', 'slam', 'smoke', 
      'tomb', 'decimation', 'def', 'ppoints', 'affliction', 'desolation',
      'maxhp', 'currenthp', 'boneshield', 'abilDamage', 'weaponTier', 
      'NecroLvl', 'sd', 'absorb', 'emerald', 'teamsize', 'adren', 'disint_dr',
      'disint_smoke', 'charge_input', 'iteration_input', 'red_input'
    ];
    
    const booleanFields = [
      'pad3', 'pad5', 'infernus', 'grey', 'aggro', 'eof', 'powder', 'totg',
      'puzzlebox', 'reaperCrew', 'eqAura', 'disr', 'cade', 'refl', 'debil',
      'immort', 'anti', 'ful', 'zerk', 'pulv', 'sever', 'enfeeble', 'anchor',
      'darkness', 'deflect', 'fort', 'dw', 'hh', 'phantom', 'ad', 'vuln',
      'croe', 'veng_check', 'defl_check', 'dtb_check', 'disint_infernus'
    ];
    
    // Convert number fields
    numberFields.forEach(field => {
      if (state[field] !== undefined) {
        state[field] = Number(state[field]);
        if (isNaN(state[field])) {
          state[field] = DEFAULT_STATE[field];
        }
      }
    });
    
    // Convert boolean fields
    booleanFields.forEach(field => {
      if (state[field] !== undefined) {
        state[field] = Boolean(state[field]);
      }
    });
    
    // Special handling for divert
    if (state.divert_res_check === "Divert" || state.divert_res_check === "Resonance") {
      state.divert = true;
    } else {
      state.divert = false;
    }
    
    // Remove metadata fields
    delete state._timestamp;
    delete state._version;
    
    return state;
  }
}