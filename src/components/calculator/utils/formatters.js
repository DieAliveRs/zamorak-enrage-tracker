// src/components/calculator/utils/formatters.js

/**
 * Format number with commas (thousands separators)
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US');
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 0) {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format damage value with K/M suffixes
 */
export function formatDamage(value) {
  if (value === null || value === undefined) return '0';
  
  const num = Number(value);
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return formatNumber(num);
}

/**
 * Format time in ticks to seconds
 */
export function formatTicksToSeconds(ticks, decimals = 1) {
  if (ticks === null || ticks === undefined) return '0';
  return `${(Number(ticks) * 0.6).toFixed(decimals)}s`;
}

/**
 * Format adrenaline (e.g., 9.5%)
 */
export function formatAdrenaline(value, decimals = 1) {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format HP value with K suffix
 */
export function formatHP(value) {
  if (value === null || value === undefined) return '0';
  
  const num = Number(value);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return formatNumber(num);
}

/**
 * Color code based on value thresholds
 */
export function getValueColor(value, thresholds = { low: 0.3, medium: 0.7 }) {
  const num = Number(value);
  
  if (num <= thresholds.low) {
    return 'text-red-600 dark:text-red-400';
  } else if (num <= thresholds.medium) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else {
    return 'text-green-600 dark:text-green-400';
  }
}

/**
 * Format gear name for display
 */
export function formatGearName(gearName) {
  if (!gearName) return '';
  
  // Remove parentheses and split
  return gearName.replace(/\([^)]*\)/g, '').trim();
}