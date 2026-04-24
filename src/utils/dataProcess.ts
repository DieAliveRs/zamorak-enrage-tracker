/**
 * Data processing utilities for kill data
 */

import type { KillData, KillRecord, PlayerBestKills } from '../types/index.js';

// ---------------------------------------------------------------------------
// Player alias groups
// Each sub-array is one player. All names in a group are treated as the same
// person. The display name is taken from whichever kill in the group is most
// recent (or the first entry in the array as a fallback).
// ---------------------------------------------------------------------------
export const PLAYER_ALIASES: string[][] = [
  // Example – remove / replace with real data:
  ['Chikorita', 'MindWorms', 'Plusle', "Bugs Bunnies", 'Bunny Bunns'],
  ['Mig gy', 'Eek gy', 'bewitching'],
  ['Vylence', 'Novita Lam'],
];

// ---------------------------------------------------------------------------
// Internal alias map built once from PLAYER_ALIASES.
// Maps every known name (lowercased) → index of its group in PLAYER_ALIASES.
// ---------------------------------------------------------------------------
let _aliasMap: Map<string, number> | null = null;

function getAliasMap(): Map<string, number> {
  if (_aliasMap) return _aliasMap;
  _aliasMap = new Map();
  PLAYER_ALIASES.forEach((group, groupIndex) => {
    group.forEach(name => {
      _aliasMap!.set(normalizePlayerName(name).toLowerCase(), groupIndex);
    });
  });
  return _aliasMap;
}

/**
 * Returns the alias-group index for a normalized name, or null if not aliased.
 */
function getAliasGroupIndex(normalizedName: string): number | null {
  const idx = getAliasMap().get(normalizedName.toLowerCase());
  return idx !== undefined ? idx : null;
}

// ---------------------------------------------------------------------------
// Existing utilities
// ---------------------------------------------------------------------------

/**
 * Normalizes player names by removing special spaces and whitespace.
 */
export function normalizePlayerName(name: string): string {
  if (!name) return name;
  return name
    .replace(/\u00A0/g, ' ')
    .replace(/\u2007/g, ' ')
    .replace(/\u202F/g, ' ')
    .replace(/\u3000/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Core processing – alias-aware
// ---------------------------------------------------------------------------

/**
 * Processes kill data to find each player's best (highest enrage) kill.
 * Players with multiple names listed in PLAYER_ALIASES are merged into one
 * entry. The display name is taken from whichever kill in the group is the
 * most recent.
 */
export function processPlayerBestKills(killData: KillData): PlayerBestKills {
  // groupKey → { bestRecord, latestRecord }
  // groupKey is either the alias-group index (as string) or the normalized name.
  const groups = new Map<string, { best: KillRecord; latest: KillRecord }>();

  killData.records.forEach(record => {
    const rawName = record.members[0]?.name || 'Unknown';
    const normalizedName = normalizePlayerName(rawName);
    const aliasIdx = getAliasGroupIndex(normalizedName);
    const groupKey = aliasIdx !== null ? `__alias_${aliasIdx}` : normalizedName;

    const existing = groups.get(groupKey);
    if (!existing) {
      groups.set(groupKey, { best: record, latest: record });
    } else {
      const newBest = record.enrage > existing.best.enrage ? record : existing.best;
      const newLatest = record.timeOfKill > existing.latest.timeOfKill ? record : existing.latest;
      groups.set(groupKey, { best: newBest, latest: newLatest });
    }
  });

  // Build the final PlayerBestKills map, keyed by the resolved display name.
  const playerBestKills: PlayerBestKills = {};

  groups.forEach(({ best, latest }, groupKey) => {
    // Display name: name on the most-recent kill, normalized.
    const displayName = normalizePlayerName(latest.members[0]?.name || 'Unknown');

    playerBestKills[displayName] = {
      ...best,
      playerName: displayName,
    };
  });

  return playerBestKills;
}

// ---------------------------------------------------------------------------
// The rest of the functions are unchanged
// ---------------------------------------------------------------------------

export function getTopPlayers(playerBestKills: PlayerBestKills, count: number = 15): KillRecord[] {
  return Object.values(playerBestKills)
    .sort((a, b) => b.enrage - a.enrage)
    .slice(0, count);
}

export function getLatestKills(killData: KillData, count: number = 5): KillRecord[] {
  const uniqueKills: KillRecord[] = [];
  const seenKeys = new Set<string>();

  const sortedKills = [...killData.records].sort((a, b) => b.timeOfKill - a.timeOfKill);

  for (const kill of sortedKills) {
    if (uniqueKills.length >= count) break;

    const playerName = kill.members[0]?.name || 'Unknown';
    const normalizedName = normalizePlayerName(playerName);
    const enrage = kill.enrage;
    const key = `${normalizedName}_${enrage}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      const killCopy = { ...kill };
      if (killCopy.members && killCopy.members[0]) {
        killCopy.members[0].name = normalizedName;
      }
      uniqueKills.push(killCopy);
    }
  }

  return uniqueKills;
}

export function getHighestEnrage(records: KillRecord[]): number {
  return records.length > 0 ? Math.max(...records.map(r => r.enrage)) : 0;
}

export function getUniquePlayersCount(playerBestKills: PlayerBestKills): number {
  return Object.keys(playerBestKills).length;
}

export function calculateAverageEnrage(records: KillRecord[]): number {
  if (records.length === 0) return 0;
  return records.reduce((sum, r) => sum + r.enrage, 0) / records.length;
}

export function calculateAverageKillTime(records: KillRecord[]): number {
  if (records.length === 0) return 0;
  return records.reduce((sum, r) => sum + r.killTimeSeconds, 0) / records.length;
}

export function calculateKillsLast24h(records: KillRecord[]): number {
  const now = Math.floor(Date.now() / 1000);
  const twentyFourHoursAgo = now - 24 * 3600;
  return records.filter(r => r.timeOfKill >= twentyFourHoursAgo).length;
}

export function getMostRecentKill(records: KillRecord[]): KillRecord | null {
  if (records.length === 0) return null;
  return [...records].sort((a, b) => b.timeOfKill - a.timeOfKill)[0];
}

export function getLastUpdateTimestamp(meta: KillData['meta']): number | null {
  if (!meta.generated_at) return null;
  if (typeof meta.generated_at === 'number') return meta.generated_at;
  if (typeof meta.generated_at === 'string') {
    const date = new Date(meta.generated_at);
    return Math.floor(date.getTime() / 1000);
  }
  return null;
}

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
    averageKillTime,
  };
}

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