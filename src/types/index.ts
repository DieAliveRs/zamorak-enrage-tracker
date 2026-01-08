export interface KillRecord {
  members: Array<{
    name: string;
  }>;
  enrage: number;
  killTimeSeconds: number;
  timeOfKill: number;
  playerName?: string; // Added by processing
}

export interface KillData {
  meta: {
    count: number;
    generated_at: number | string;
  };
  records: KillRecord[];
}

export interface PlayerBestKills {
  [playerName: string]: KillRecord;
}