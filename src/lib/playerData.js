// src/lib/playerData.js

// Helper functions
function formatKillTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${secs.padStart(4, '0')}`;
}

function timeAgo(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;
  
  if (secondsAgo < 60) return 'Just now';
  
  const hours = Math.floor(secondsAgo / 3600);
  const minutes = Math.floor((secondsAgo % 3600) / 60);
  
  if (hours > 0) {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
    return `${hours}h ${minutes}m ago`;
  }
  return `${minutes}m ago`;
}

function timeAgoDetailed(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;
  
  const days = Math.floor(secondsAgo / 86400);
  const hours = Math.floor((secondsAgo % 86400) / 3600);
  const minutes = Math.floor((secondsAgo % 3600) / 60);
  
  if (days > 0) {
    if (hours > 0) {
      return `${days}d ${hours}h ago`;
    }
    return `${days}d ago`;
  }
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  return `${minutes}m ago`;
}

// Main data processing function
export async function loadAndProcessData() {
  try {
    const response = await fetch('/data/data.json');
    const killData = await response.json();
    
    // Group kills by player
    const players = {};
    
    killData.records.forEach(record => {
      const playerName = record.members[0]?.name || 'Unknown';
      
      if (!players[playerName]) {
        players[playerName] = {
          player: playerName,
          kills: [],
          lastUpdated: killData.meta.generated_at
        };
      }
      
      players[playerName].kills.push({
        enrage: record.enrage,
        timeOfKill: record.timeOfKill,
        killTimeSeconds: record.killTimeSeconds,
        date: new Date(record.timeOfKill * 1000),
        formattedDate: new Date(record.timeOfKill * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        formattedKillTime: formatKillTime(record.killTimeSeconds),
        timeAgo: timeAgo(record.timeOfKill),
        timeAgoDetailed: timeAgoDetailed(record.timeOfKill)
      });
    });
    
    // Sort each player's kills by date (newest first)
    Object.values(players).forEach(player => {
      player.kills.sort((a, b) => b.timeOfKill - a.timeOfKill);
    });
    
    return {
      players,
      meta: killData.meta,
      totalRecords: killData.records.length
    };
  } catch (error) {
    console.error('Error loading player data:', error);
    return {
      players: {},
      meta: { generated_at: new Date().toISOString(), count: 0 },
      totalRecords: 0
    };
  }
}

// Get player stats when selected
export function getPlayerStats(playerKills, playerName) {
  if (!playerKills || playerKills.length === 0) {
    return null;
  }
  
  // Sort kills by enrage (highest first) and date (newest first)
  const sortedByEnrage = [...playerKills].sort((a, b) => b.enrage - a.enrage);
  const sortedByDate = [...playerKills].sort((a, b) => b.timeOfKill - a.timeOfKill);
  
  // Calculate total kills
  const totalKills = playerKills.length;
  
  // Highest enrage
  const highestEnrage = sortedByEnrage[0].enrage;
  const highestEnrageKill = sortedByEnrage[0];
  
  // Average kill time
  const avgKillTime = playerKills.reduce((sum, kill) => sum + kill.killTimeSeconds, 0) / totalKills;
  
  // Recent activity
  const mostRecentKill = sortedByDate[0];
  const timeSinceLastKill = timeAgoDetailed(mostRecentKill.timeOfKill);
  
  // Calculate enrage brackets
  const brackets = calculateEnrageBrackets(playerKills);
  
  // Calculate timeline milestones
  const timeline = calculateTimelineMilestones(playerKills);
  
  // Calculate most kills in 24h period
  const mostKills24h = calculateMostKillsIn24h(playerKills);
  
  // Calculate predictions
  const predictions = calculatePredictions(playerKills);
  
  return {
    player: playerName,
    totalKills,
    highestEnrage,
    highestEnrageKill,
    avgKillTime: formatKillTime(avgKillTime),
    avgKillTimeSeconds: avgKillTime,
    mostRecentKill,
    timeSinceLastKill,
    brackets,
    timeline,
    mostKills24h,
    predictions,
    allKills: sortedByDate // For table display
  };
}

function calculateEnrageBrackets(kills) {
  // Define bracket ranges
  const bracketRanges = [
    { min: 0, max: 9999, label: '0-10k' },
    { min: 10000, max: 19999, label: '10-20k' },
    { min: 20000, max: 29999, label: '20-30k' },
    { min: 30000, max: 39999, label: '30-40k' },
    { min: 40000, max: 49999, label: '40-50k' },
    { min: 50000, max: 59999, label: '50-60k' },
    { min: 60000, max: 69999, label: '60-70k' }
  ];
  
  return bracketRanges
    .map(range => {
      const bracketKills = kills.filter(kill => 
        kill.enrage >= range.min && kill.enrage <= range.max
      );
      
      if (bracketKills.length === 0) return null;
      
      const avgTime = bracketKills.reduce((sum, kill) => sum + kill.killTimeSeconds, 0) / bracketKills.length;
      const fastestKill = bracketKills.reduce((fastest, kill) => 
        kill.killTimeSeconds < fastest.killTimeSeconds ? kill : fastest
      );
      
      return {
        range: range.label,
        min: range.min,
        max: range.max,
        kills: bracketKills.length,
        avgTime: formatKillTime(avgTime),
        avgTimeSeconds: avgTime,
        fastestKill,
        fastestTime: formatKillTime(fastestKill.killTimeSeconds)
      };
    })
    .filter(bracket => bracket !== null);
}

function calculateTimelineMilestones(kills) {
  if (kills.length === 0) return [];
  
  // Sort by date
  const sortedByDate = [...kills].sort((a, b) => a.timeOfKill - b.timeOfKill);
  
  const milestones = [];
  let currentMilestone = 0;
  
  // Define milestone thresholds
  const thresholds = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];
  
  sortedByDate.forEach(kill => {
    // Check if this kill reaches a new milestone
    const nextThreshold = thresholds.find(t => t > currentMilestone && kill.enrage >= t);
    
    if (nextThreshold) {
      milestones.push({
        enrage: nextThreshold,
        date: kill.date,
        timestamp: kill.timeOfKill,
        killTime: kill.formattedKillTime,
        label: `${(nextThreshold / 1000).toFixed(0)}k`
      });
      currentMilestone = nextThreshold;
    }
  });
  
  return milestones;
}

function calculateMostKillsIn24h(kills) {
  if (kills.length === 0) return { count: 0, period: null };
  
  let maxKills = 0;
  let bestPeriod = null;
  
  // Sort by time
  const sortedKills = [...kills].sort((a, b) => a.timeOfKill - b.timeOfKill);
  
  for (let i = 0; i < sortedKills.length; i++) {
    const startTime = sortedKills[i].timeOfKill;
    const endTime = startTime + 86400; // 24 hours in seconds
    
    let j = i;
    while (j < sortedKills.length && sortedKills[j].timeOfKill <= endTime) {
      j++;
    }
    
    const killsIn24h = j - i;
    if (killsIn24h > maxKills) {
      maxKills = killsIn24h;
      bestPeriod = {
        start: new Date(startTime * 1000),
        end: new Date(endTime * 1000),
        startIndex: i,
        endIndex: j - 1
      };
    }
  }
  
  return {
    count: maxKills,
    period: bestPeriod
  };
}

function calculatePredictions(kills) {
  if (kills.length < 3) {
    return {
      nextMilestone: "Need more data",
      improvementRate: "Need more data",
      suggestions: ["Complete more kills to get predictions"]
    };
  }
  
  // Sort by date for trend analysis
  const sortedByDate = [...kills].sort((a, b) => a.timeOfKill - b.timeOfKill);
  
  // Calculate improvement rate (enrage increase per week)
  const firstKill = sortedByDate[0];
  const lastKill = sortedByDate[sortedByDate.length - 1];
  const weeksBetween = (lastKill.timeOfKill - firstKill.timeOfKill) / (86400 * 7);
  const enrageIncrease = lastKill.enrage - firstKill.enrage;
  const weeklyImprovement = weeksBetween > 0 ? enrageIncrease / weeksBetween : 0;
  
  // Predict next milestone (next 5k increment)
  const nextMilestone = Math.ceil(lastKill.enrage / 5000) * 5000;
  const enrageNeeded = nextMilestone - lastKill.enrage;
  const weeksToNext = weeklyImprovement > 0 ? enrageNeeded / weeklyImprovement : null;
  
  // Generate suggestions
  const suggestions = [];
  const brackets = calculateEnrageBrackets(kills);
  
  if (brackets.length > 0) {
    const currentBracket = brackets[brackets.length - 1];
    if (currentBracket.kills < 5) {
      suggestions.push(`Get more experience in ${currentBracket.range} bracket (${currentBracket.kills} kills so far)`);
    }
    
    // Find bracket with slowest average time
    const slowestBracket = brackets.reduce((slowest, bracket) => 
      bracket.avgTimeSeconds > slowest.avgTimeSeconds ? bracket : slowest
    );
    suggestions.push(`Focus on improving ${slowestBracket.range} bracket times (avg: ${slowestBracket.avgTime})`);
  }
  
  return {
    nextMilestone: weeksToNext ? 
      `${(nextMilestone / 1000).toFixed(0)}k in ~${Math.ceil(weeksToNext)} weeks` : 
      `${(nextMilestone / 1000).toFixed(0)}k (rate unknown)`,
    improvementRate: `${Math.round(weeklyImprovement)} enrage/week`,
    suggestions
  };
}

// Get unique players for dropdown
export function getUniquePlayers(playersData) {
  return Object.keys(playersData.players || {}).sort();
}