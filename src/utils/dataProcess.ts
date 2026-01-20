/**
 * Data processing utilities for kill data
 */

import type { KillData, KillRecord, PlayerBestKills } from '../types/index.js';

/**
 * Normalizes player names by removing special spaces and whitespace
 */
export function normalizePlayerName(name: string): string {
  if (!name) return name;
  
  return name
    .replace(/\u00A0/g, ' ')  // Non-breaking space
    .replace(/\u2007/g, ' ')  // Figure space
    .replace(/\u202F/g, ' ')  // Narrow non-breaking space
    .replace(/\u3000/g, ' ')  // Ideographic space
    .replace(/\s+/g, ' ')     // Multiple spaces to single space
    .trim();
}

/**
 * Processes kill data to find each player's best (highest enrage) kill
 */
export function processPlayerBestKills(killData: KillData): PlayerBestKills {
  const playerBestKills: PlayerBestKills = {};
  
  killData.records.forEach(record => {
    const playerName = record.members[0]?.name || 'Unknown';
    const normalizedName = normalizePlayerName(playerName);
    
    if (!playerBestKills[normalizedName] || record.enrage > playerBestKills[normalizedName].enrage) {
      playerBestKills[normalizedName] = {
        ...record,
        playerName: normalizedName
      };
    }
  });
  
  return playerBestKills;
}

/**
 * Gets top players sorted by highest enrage
 */
export function getTopPlayers(playerBestKills: PlayerBestKills, count: number = 15): KillRecord[] {
  return Object.values(playerBestKills)
    .sort((a, b) => b.enrage - a.enrage)
    .slice(0, count);
}

/**
 * Gets latest kills sorted by most recent
 */
export function getLatestKills(killData: KillData, count: number = 5): KillRecord[] {
  const uniqueKills: KillRecord[] = [];
  const seenKeys = new Set<string>();
  
  // Sort kills by most recent first
  const sortedKills = [...killData.records]
    .sort((a, b) => b.timeOfKill - a.timeOfKill);
  
  // Iterate through sorted kills until we have enough unique ones
  for (const kill of sortedKills) {
    if (uniqueKills.length >= count) break;
    
    const playerName = kill.members[0]?.name || 'Unknown';
    const normalizedName = normalizePlayerName(playerName);
    const enrage = kill.enrage;
    
    // Create a unique key combining normalized player name and enrage
    const key = `${normalizedName}_${enrage}`;
    
    // If this combination doesn't exist yet, add it
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      // Store the kill with normalized name for consistency
      const killCopy = { ...kill };
      if (killCopy.members && killCopy.members[0]) {
        killCopy.members[0].name = normalizedName;
      }
      uniqueKills.push(killCopy);
    }
  }
  
  return uniqueKills;
}

/**
 * Calculates the highest enrage from kill records
 */
export function getHighestEnrage(records: KillRecord[]): number {
  return records.length > 0 
    ? Math.max(...records.map(r => r.enrage))
    : 0;
}

/**
 * Calculates unique players count from processed best kills
 */
export function getUniquePlayersCount(playerBestKills: PlayerBestKills): number {
  return Object.keys(playerBestKills).length;
}

/**
 * Calculates average enrage from kill records
 */
export function calculateAverageEnrage(records: KillRecord[]): number {
  if (records.length === 0) return 0;
  return records.reduce((sum, r) => sum + r.enrage, 0) / records.length;
}

/**
 * Calculates average kill time from kill records
 */
export function calculateAverageKillTime(records: KillRecord[]): number {
  if (records.length === 0) return 0;
  return records.reduce((sum, r) => sum + r.killTimeSeconds, 0) / records.length;
}

/**
 * Calculates kills in the last 24 hours
 */
export function calculateKillsLast24h(records: KillRecord[]): number {
  const now = Math.floor(Date.now() / 1000);
  const twentyFourHoursAgo = now - (24 * 3600);
  return records.filter(r => r.timeOfKill >= twentyFourHoursAgo).length;
}

/**
 * Gets the most recent kill record
 */
export function getMostRecentKill(records: KillRecord[]): KillRecord | null {
  if (records.length === 0) return null;
  const sorted = [...records].sort((a, b) => b.timeOfKill - a.timeOfKill);
  return sorted[0];
}

/**
 * Parses generated_at timestamp from meta data
 */
export function getLastUpdateTimestamp(meta: KillData['meta']): number | null {
  if (!meta.generated_at) return null;
  
  if (typeof meta.generated_at === 'number') {
    return meta.generated_at;
  } else if (typeof meta.generated_at === 'string') {
    const date = new Date(meta.generated_at);
    return Math.floor(date.getTime() / 1000);
  }
  return null;
}

/**
 * Processes all kill data and returns structured data for the page
 */
export function processPageData(killData: KillData) {
  const playerBestKills = processPlayerBestKills(killData);
  const topPlayers = getTopPlayers(playerBestKills, 15);
  const latestKills = getLatestKills(killData, 5);
  const uniquePlayersCount = getUniquePlayersCount(playerBestKills);
  const totalKills = killData.meta.count || 0;
  const highestEnrage = getHighestEnrage(killData.records);
  const averageEnrage = calculateAverageEnrage(killData.records);
  const averageKillTime = calculateAverageKillTime(killData.records);
  
  return {
    killData,
    totalKills,
    highestEnrage,
    topPlayers,
    latestKills,
    uniquePlayersCount,
    playerBestKills,
    averageEnrage,
    averageKillTime
  };
}

// Type for the processed page data
export interface ProcessedPageData {
  killData: KillData;
  totalKills: number;
  highestEnrage: number;
  topPlayers: KillRecord[];
  latestKills: KillRecord[];
  uniquePlayersCount: number;
  playerBestKills: PlayerBestKills;
  averageEnrage: number;
  averageKillTime: number;
}