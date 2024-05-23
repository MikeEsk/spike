interface Team {
  team: number[];
  score: string;
}

interface Game {
  winner: Team;
  loser: Team;
}

const getWinsByPlayerId = (playerId: number, games: Game[]): number => {
  return games.reduce((acc, game) => {
    if (game.winner.team.includes(playerId)) {
      acc++;
    }
    return acc;
  }, 0);
};

const getWinsByTeamId = (teamId: number[], games: Game[]): number => {
  return games.reduce((acc, game) => {
    if (teamId.every((id) => game.winner.team.includes(id))) {
      acc++;
    }
    return acc;
  }, 0);
};

const getLossesByPlayerId = (playerId: number, games: Game[]): number => {
  return games.reduce((acc, game) => {
    if (game.loser.team.includes(playerId)) {
      acc++;
    }
    return acc;
  }, 0);
};

const getLossesByTeamId = (teamId: number[], games: Game[]): number => {
  return games.reduce((acc, game) => {
    if (teamId.every((id) => game.loser.team.includes(id))) {
      acc++;
    }
    return acc;
  }, 0);
};

const pointsPerGamePerPlayer = (playerId: number, games: Game[]): number => {
  let totalScore = 0;
  let gameCount = 0;

  games.forEach((game) => {
    if (game.winner.team.includes(playerId)) {
      totalScore += parseInt(game.winner.score);
      gameCount++;
    } else if (game.loser.team.includes(playerId)) {
      totalScore += parseInt(game.loser.score);
      gameCount++;
    }
  });

  return gameCount > 0 ? totalScore / gameCount : 0;
};

const pointsPerGamePerTeam = (teamId: number[], games: Game[]): number => {
  let totalScore = 0;
  let gameCount = 0;
  games.forEach((game) => {
    if (teamId.every((id) => game.winner.team.includes(id))) {
      totalScore += parseInt(game.winner.score);
      gameCount++;
    }
    if (teamId.every((id) => game.loser.team.includes(id))) {
      totalScore += parseInt(game.loser.score);
      gameCount++;
    }
  });
  return gameCount > 0 ? totalScore / gameCount : 0;
};

const biggestWinMargin = (
  games: Game[]
): {
  biggestMargin: number;
  game: Game | null;
} => {
  if (games.length === 0) {
    return { biggestMargin: 0, game: null };
  }

  return games.reduce(
    (acc, game) => {
      const margin = Math.abs(
        parseInt(game.winner.score) - parseInt(game.loser.score)
      );
      if (margin > acc.biggestMargin) {
        acc.biggestMargin = margin;
        acc.game = game;
      }
      return acc;
    },
    { biggestMargin: 0, game: games[0] }
  );
};

const calculateStreak = (
  teamId: number[],
  games: Game[],
  isLosingStreak: boolean = false
): { currentStreak: number; longestStreak: number } => {
  let longestStreak = 0;
  let currentStreak = 0;

  const normalizedTeamId = teamId.sort((a, b) => a - b).join("-");

  games.forEach((game) => {
    const normalizedWinnerTeam = game.winner.team
      .sort((a, b) => a - b)
      .join("-");
    const normalizedLoserTeam = game.loser.team.sort((a, b) => a - b).join("-");

    if (isLosingStreak) {
      if (normalizedTeamId === normalizedLoserTeam) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    } else {
      if (normalizedTeamId === normalizedWinnerTeam) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
  });

  return { currentStreak, longestStreak };
};

const extractUniqueTeams = (games: Game[]) => {
  const teams = new Set();
  games.forEach((game) => {
    const winnerTeam = game.winner.team
      .map(Number)
      .sort((a, b) => a - b)
      .join("-");
    const loserTeam = game.loser.team
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

const calculateTeamStats = (games: Game[]) => {
  const uniqueTeams = extractUniqueTeams(games);
  return uniqueTeams.map((team) => {
    const wins = getWinsByTeamId(team, games);
    const losses = getLossesByTeamId(team, games);
    const pointsPerGame = pointsPerGamePerTeam(team, games);

    return {
      team: team,
      wins: wins,
      losses: losses,
      winPercentage:
        wins + losses > 0
          ? `${Math.round((wins / (wins + losses)) * 100)}%`
          : "0%",
      pointsPerGame,
      currentStreak: calculateStreak(team, games).currentStreak,
      longestStreak: calculateStreak(team, games).longestStreak,
    };
  });
};

const calculateAllPlayerStats = (
  profiles: { id: number; name: string }[],
  games: Game[]
) => {
  return profiles.map((profile) => {
    const wins = getWinsByPlayerId(profile.id, games);
    const losses = getLossesByPlayerId(profile.id, games);
    const pointsPerGame = pointsPerGamePerPlayer(profile.id, games);

    return {
      id: profile.id,
      name: profile.name,
      wins: wins,
      losses: losses,
      winPercentage:
        wins + losses > 0
          ? `${Math.round((wins / (wins + losses)) * 100)}%`
          : "0%",
      pointsPerGame: pointsPerGame,
      currentStreak: calculateStreak([profile.id], games).currentStreak,
      longestStreak: calculateStreak([profile.id], games).longestStreak,
    };
  });
};

const getHighestScoringGame = (games: Game[]): Game => {
  return games.reduce((prev, current) => {
    const prevTotal = +prev.winner.score + +prev.loser.score;
    const currentTotal = +current.winner.score + +current.loser.score;
    return prevTotal > currentTotal ? prev : current;
  });
};

const calculatePlayerChange = (
  profiles: number[],
  games: Game[],
  type: "improvement" | "worsening" = "improvement"
) => {
  return profiles
    .map((profile) => {
      const playerGames = games.filter(
        (game) =>
          game.winner.team.includes(profile) ||
          game.loser.team.includes(profile)
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

const calculateBestRevengeMatch = (games: Game[]) => {
  let bestRevengeGame = null;
  let previousLossGame = null;
  let maxPointDifference = 0;
  games.forEach((game, index) => {
    const previousLoss = games
      .slice(0, index)
      .reverse()
      .find(
        (g) =>
          g.loser.team.includes(game.winner.team[0]) &&
          g.winner.team.includes(game.loser.team[0])
      );
    if (previousLoss) {
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

const calculateZeroScoreDefeats = (profiles: number[], games: Game[]) => {
  const results = profiles.map((profile) => {
    console.log("profile", profile);
    const zeroScoreGames = games.filter(
      (game) => game.loser.team.includes(profile) && +game.loser.score === 0
    );
    return {
      profile,
      zeroScoreDefeats: zeroScoreGames.length,
    };
  });

  return results.sort((a, b) => b.zeroScoreDefeats - a.zeroScoreDefeats);
};

const calculateWinPercentage = (games: Game[], playerId: number) => {
  const wins = games.filter((game) =>
    game.winner.team.includes(playerId)
  ).length;
  return games.length > 0 ? (wins / games.length) * 100 : 0;
};

const aggregateStats = (games: Game[]) => {
  const profiles = games.reduce<number[]>((acc, game) => {
    game.winner.team.forEach((playerId) => {
      if (!acc.includes(playerId)) {
        acc.push(playerId);
      }
    });
    game.loser.team.forEach((playerId) => {
      if (!acc.includes(playerId)) {
        acc.push(playerId);
      }
    });
    return acc;
  }, []);

  const biggestWin = biggestWinMargin(games);

  const highestScoringGame = getHighestScoringGame(games);

  const uniqueTeams = extractUniqueTeams(games);

  const winningStreaks = uniqueTeams
    .map((team) => ({
      team,
      ...calculateStreak(team, games),
    }))
    .sort((a, b) => b.currentStreak - a.currentStreak);

  const lossStreaks = uniqueTeams
    .map((team) => ({
      team,
      ...calculateStreak(team, games, true),
    }))
    .sort((a, b) => b.currentStreak - a.currentStreak);
  const teamStats = calculateTeamStats(games);

  const mostImprovedPlayer = calculatePlayerChange(
    profiles,
    games,
    "improvement"
  );

  const mostWorsenedPlayer = calculatePlayerChange(
    profiles,
    games,
    "worsening"
  );

  const bestRevengeMatch = calculateBestRevengeMatch(games);

  const zeroScoreDefeats = calculateZeroScoreDefeats(profiles, games);

  return {
    biggestWin,
    highestScoringGame,
    winningStreaks,
    lossStreaks,
    teamStats,
    mostImprovedPlayer,
    mostWorsenedPlayer,
    bestRevengeMatch,
    zeroScoreDefeats,
  };
};

export { calculateAllPlayerStats, calculateTeamStats, aggregateStats };
