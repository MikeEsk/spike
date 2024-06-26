import { MatchResult } from "../types";

const getWinsByPlayerId = (
  playerId: number,
  matchResults: MatchResult[]
): number => {
  return matchResults.reduce((acc, game) => {
    if (game.winner?.team.includes(playerId)) {
      acc++;
    }
    return acc;
  }, 0);
};

const getWinsByTeamId = (
  teamId: number[],
  matchResults: MatchResult[]
): number => {
  return matchResults.reduce((acc, game) => {
    if (teamId.every((id) => game.winner?.team.includes(id))) {
      acc++;
    }
    return acc;
  }, 0);
};

const getLossesByPlayerId = (
  playerId: number,
  matchResults: MatchResult[]
): number => {
  return matchResults.reduce((acc, game) => {
    if (game.loser?.team.includes(playerId)) {
      acc++;
    }
    return acc;
  }, 0);
};

const getLossesByTeamId = (
  teamId: number[],
  matchResults: MatchResult[]
): number => {
  return matchResults.reduce((acc, game) => {
    if (teamId.every((id) => game.loser?.team.includes(id))) {
      acc++;
    }
    return acc;
  }, 0);
};

const pointsPerGamePerPlayer = (
  playerId: number,
  matchResults: MatchResult[]
): number => {
  let totalScore = 0;
  let gameCount = 0;

  matchResults.forEach((game) => {
    if (game.winner?.team.includes(playerId)) {
      totalScore += parseInt(game.winner?.score);
      gameCount++;
    } else if (game.loser?.team.includes(playerId)) {
      totalScore += parseInt(game.loser?.score);
      gameCount++;
    }
  });

  return gameCount > 0 ? +(totalScore / gameCount).toFixed(1) : 0;
};

const pointsPerGamePerTeam = (
  teamId: number[],
  matchResults: MatchResult[]
): number => {
  let totalScore = 0;
  let gameCount = 0;
  matchResults.forEach((game) => {
    if (!game.winner || !game.loser) return;
    if (teamId.every((id) => game.winner?.team.includes(id))) {
      totalScore += parseInt(game.winner?.score);
      gameCount++;
    }
    if (teamId.every((id) => game.loser?.team.includes(id))) {
      totalScore += parseInt(game.loser?.score);
      gameCount++;
    }
  });
  return gameCount > 0 ? +(totalScore / gameCount).toFixed(1) : 0;
};

const getBiggestWinMarginInSeries = (
  matchResults: MatchResult[],
  seriesLength: number = 3
): { biggestMargin: number; series: MatchResult[] | null } => {
  if (matchResults.length < seriesLength) {
    return { biggestMargin: 0, series: null };
  }
  let maxMargin = 0;
  let maxMarginSeries: MatchResult[] | null = null;

  for (let i = 0; i <= matchResults.length - seriesLength; i++) {
    const series = matchResults.slice(i, i + seriesLength);

    // Create a set of unique matchups in the series
    const matchups = new Set();
    series.forEach((game) => {
      if (!game.winner || !game.loser) return;
      const teams = [...game.winner?.team, ...game.loser?.team]
        .sort((a, b) => a - b)
        .join("-");
      matchups.add(teams);
    });

    // Continue only if there is exactly one unique matchup in the series
    if (matchups.size === 1) {
      let winCounts: { [key: string]: number } = {};
      const teamIdsToString = (teamIds: number[]) =>
        teamIds.sort((a, b) => a - b).join("-");

      series.forEach((game) => {
        if (!game.winner || !game.loser) return;
        const winningTeam = teamIdsToString(game.winner?.team);
        winCounts[winningTeam] = (winCounts[winningTeam] || 0) + 1;
      });

      const hasTwoWins = Object.values(winCounts).some((count) => count >= 2);

      if (hasTwoWins) {
        const margin = series.reduce((acc, game) => {
          if (!game.winner || !game.loser) return acc;
          const winnerScore = parseInt(game.winner.score);
          const loserScore = parseInt(game.loser.score);
          return acc + Math.abs(winnerScore - loserScore);
        }, 0);

        if (margin > maxMargin) {
          maxMargin = margin;
          maxMarginSeries = series;
        }
      }
    }
  }

  return { biggestMargin: maxMargin, series: maxMarginSeries };
};

const calculateStreak = (
  ids: number[], // Can be a teamId or a playerId wrapped in an array
  matchResults: MatchResult[]
): { currentStreak: number; longestStreak: number } => {
  let longestStreak = 0;
  let currentStreak = 0;

  matchResults.forEach((game) => {
    let isWin = false;
    let isLoss = false;

    if (
      (ids.length === 1 && game.winner?.team.includes(ids[0])) ||
      ids.every((id) => game.winner?.team.includes(id))
    ) {
      currentStreak++;
    } else if (
      (ids.length === 1 && game.loser?.team.includes(ids[0])) ||
      ids.every((id) => game.loser?.team.includes(id))
    ) {
      currentStreak = 0;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  });

  return { currentStreak, longestStreak };
};

const extractUniqueTeams = (matchResults: MatchResult[]) => {
  const teams = new Set();
  matchResults.forEach((game) => {
    const winnerTeam = game.winner?.team
      .map(Number)
      .sort((a, b) => a - b)
      .join("-");
    const loserTeam = game.loser?.team
      .map(Number)
      .sort((a, b) => a - b)
      .join("-");
    teams.add(winnerTeam);
    teams.add(loserTeam);
  });
  return Array.from(teams as Set<string>).map((team: string) =>
    team.split("-").map(Number)
  );
};

const calculateTeamStats = (matchResults: MatchResult[]) => {
  const uniqueTeams = extractUniqueTeams(matchResults);
  const teamStats = uniqueTeams.map((team) => {
    const wins = getWinsByTeamId(team, matchResults);
    const losses = getLossesByTeamId(team, matchResults);
    const pointsPerGame = pointsPerGamePerTeam(team, matchResults);

    return {
      team: team,
      wins: wins,
      losses: losses,
      winPercentage:
        wins + losses > 0
          ? `${Math.round((wins / (wins + losses)) * 100)}%`
          : "0%",
      pointsPerGame,
      currentStreak: calculateStreak(team, matchResults).currentStreak,
      longestStreak: calculateStreak(team, matchResults).longestStreak,
    };
  });

  return teamStats.sort((a, b) => {
    const winPercentageDiff =
      parseFloat(b.winPercentage) - parseFloat(a.winPercentage);
    if (winPercentageDiff !== 0) {
      return winPercentageDiff;
    }
    return b.pointsPerGame - a.pointsPerGame;
  });
};

const calculateAllPlayerStats = (
  profiles: { id: number; name: string }[],
  matchResults: MatchResult[]
) => {
  const playerStats = profiles.map((profile) => {
    const wins = getWinsByPlayerId(profile.id, matchResults);
    const losses = getLossesByPlayerId(profile.id, matchResults);
    const pointsPerGame = pointsPerGamePerPlayer(profile.id, matchResults);
    const winPercentage = wins + losses > 0 ? wins / (wins + losses) : 0;

    return {
      id: profile.id,
      name: profile.name,
      wins: wins,
      losses: losses,
      winPercentage: `${Math.round(winPercentage * 100)}%`,
      pointsPerGame: pointsPerGame,
      currentStreak: calculateStreak([profile.id], matchResults).currentStreak,
      longestStreak: calculateStreak([profile.id], matchResults).longestStreak,
    };
  });

  // Sort by win percentage in descending order
  return playerStats.sort(
    (a, b) => parseFloat(b.winPercentage) - parseFloat(a.winPercentage)
  );
};

const getHighestScoringGame = (matchResults: MatchResult[]): MatchResult => {
  return matchResults.reduce((prev, current) => {
    if (!prev.winner || !prev.loser || !current.winner || !current.loser)
      return prev;
    const prevTotal = +prev.winner?.score + +prev.loser?.score;
    const currentTotal = +current.winner?.score + +current.loser?.score;
    return prevTotal > currentTotal ? prev : current;
  });
};

const calculatePlayerChange = (
  profiles: number[],
  matchResults: MatchResult[],
  type: "improvement" | "worsening" = "improvement"
) => {
  return profiles
    .map((profile) => {
      const playerGames = matchResults.filter(
        (game) =>
          game.winner?.team.includes(profile) ||
          game.loser?.team.includes(profile)
      );
      const recentGames = playerGames.slice(-10).reverse();
      const halfPoint = Math.ceil(recentGames.length / 2);
      const firstHalf = recentGames.slice(0, halfPoint);
      const secondHalf = recentGames.slice(halfPoint);
      const firstWinPercentage = calculateWinPercentage(firstHalf, profile);
      const secondWinPercentage = calculateWinPercentage(secondHalf, profile);

      const change = secondWinPercentage - firstWinPercentage;
      return {
        profile,
        change,
        improvement: change > 0 ? change : 0,
        worsening: change < 0 ? -change : 0,
      };
    })
    .sort((a, b) =>
      type === "improvement"
        ? b.improvement - a.improvement
        : b.worsening - a.worsening
    )[0];
};

const calculateBestRevengeMatch = (matchResults: MatchResult[]) => {
  let bestRevengeGame = null;
  let previousLossGame = null;
  let maxPointDifference = 0;
  matchResults.forEach((game, index) => {
    if (!game.winner?.team[0] || !game.loser?.team[0]) return;
    const previousLoss = matchResults
      .slice(0, index)
      .reverse()
      .find(
        (g) =>
          g.loser?.team.includes(game.winner!.team[0]) &&
          g.winner?.team.includes(game.loser!.team[0])
      );
    if (
      previousLoss &&
      previousLoss.loser?.score !== undefined &&
      game.winner?.score !== undefined
    ) {
      const pointDifference = +game.winner.score - +previousLoss.loser.score;
      if (pointDifference > maxPointDifference) {
        maxPointDifference = pointDifference;
        bestRevengeGame = game;
        previousLossGame = previousLoss;
      }
    }
  });
  return { bestRevengeGame, previousLossGame };
};

const calculateZeroScoreDefeats = (
  profiles: number[],
  matchResults: MatchResult[]
) => {
  const results = profiles.map((id) => {
    const zeroScoreGames = matchResults.filter(
      (game) => game.loser?.team.includes(id) && +game.loser?.score === 0
    );
    return {
      id,
      zeroScoreDefeats: zeroScoreGames.length,
    };
  });

  return results.sort((a, b) => b.zeroScoreDefeats - a.zeroScoreDefeats);
};

const calculateWinPercentage = (
  matchResults: MatchResult[],
  playerId: number
) => {
  const wins = matchResults.filter((game) =>
    game.winner?.team.includes(playerId)
  ).length;
  return matchResults.length > 0 ? (wins / matchResults.length) * 100 : 0;
};

const aggregateStats = (matchResults: MatchResult[]) => {
  const profiles = matchResults.reduce<number[]>((acc, game) => {
    game.winner?.team.forEach((playerId) => {
      if (!acc.includes(playerId)) {
        acc.push(playerId);
      }
    });
    game.loser?.team.forEach((playerId) => {
      if (!acc.includes(playerId)) {
        acc.push(playerId);
      }
    });
    return acc;
  }, []);

  const biggestWinMarginInSeries = getBiggestWinMarginInSeries(matchResults);

  const highestScoringGame = getHighestScoringGame(matchResults);

  const uniqueTeams = extractUniqueTeams(matchResults);

  const winningStreaks = uniqueTeams
    .map((team) => ({
      team,
      ...calculateStreak(team, matchResults),
    }))
    .sort((a, b) => b.currentStreak - a.currentStreak);

  const teamStats = calculateTeamStats(matchResults);

  const mostImprovedPlayer = calculatePlayerChange(
    profiles,
    matchResults,
    "improvement"
  );

  const mostWorsenedPlayer = calculatePlayerChange(
    profiles,
    matchResults,
    "worsening"
  );

  const bestRevengeMatch = calculateBestRevengeMatch(matchResults);

  const zeroScoreDefeats = calculateZeroScoreDefeats(profiles, matchResults);

  return {
    biggestWinMarginInSeries,
    highestScoringGame,
    winningStreaks,
    teamStats,
    mostImprovedPlayer,
    mostWorsenedPlayer,
    bestRevengeMatch,
    zeroScoreDefeats,
  };
};

export { calculateAllPlayerStats, calculateTeamStats, aggregateStats };
