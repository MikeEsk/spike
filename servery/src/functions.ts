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

const averageScorePerPlayer = (playerId: number, games: Game[]): number => {
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

const averageScorePerTeam = (teamId: number[], games: Game[]): number => {
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

const calculateWinningStreaks = (
  teamId: number[],
  games: Game[]
): { currentStreak: number; longestStreak: number } => {
  let longestStreak = 0;
  let currentStreak = 0;

  const normalizedTeamId = teamId.sort((a, b) => a - b).join("-");

  games.forEach((game) => {
    const normalizedWinnerTeam = game.winner.team
      .sort((a, b) => a - b)
      .join("-");
    const normalizedLoserTeam = game.loser.team.sort((a, b) => a - b).join("-");

    if (normalizedTeamId === normalizedWinnerTeam) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (normalizedTeamId === normalizedLoserTeam) {
      currentStreak = 0;
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
    const averageScore = averageScorePerTeam(team, games);

    return {
      team: team,
      wins: wins,
      losses: losses,
      averageScore: averageScore,
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
    const averageScore = averageScorePerPlayer(profile.id, games);

    return {
      id: profile.id,
      name: profile.name,
      wins: wins,
      losses: losses,
      averageScore: averageScore,
    };
  });
};

const aggregateStats = (games: Game[]) => {
  const biggestWin = biggestWinMargin(games);
  const uniqueTeams = extractUniqueTeams(games);
  const winningStreaks = uniqueTeams.map((team) => ({
    team,
    ...calculateWinningStreaks(team, games),
  }));
  const teamStats = calculateTeamStats(games);

  return {
    biggestWin,
    winningStreaks,
    teamStats,
  };
};

export { calculateAllPlayerStats, calculateTeamStats, aggregateStats };
