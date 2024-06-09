type Team = number[];

interface TeamScore {
  team: Team;
  score: string;
}

// Interface for a MatchResult
interface MatchResult {
  winner: TeamScore | null;
  loser: TeamScore | null;
}

// Enum for bracket types
enum BracketType {
  Main = "Main",
  Losers = "Losers",
}

// Interface for a Tournament
interface Tournament {
  type: "double" | "single";
  name: string;
  startTime: Date;
  endTime: Date;
  teams: TeamWithSeed[];
  rounds: { [key: number]: Match[] };
}

interface TeamWithSeed {
  team: Team | null;
  seed: number | null;
}

// Interface for a Match
interface Match {
  teams: [TeamWithSeed | null, TeamWithSeed | null]; // Pair of teams participating in the match
  result: MatchResult | null; // Optional game result, present only after the match is concluded
  bracketType: BracketType; // Indicates if the match is in the Main or Losers bracket
}

const createTournamentFromTeams = (
  teamsArray: Team[],
  name: string
): Tournament => {
  const tournamentType: "single" | "double" = "single"; // This could be dynamic based on some condition or input
  const tournamentName: string = name; // This could be dynamic based on some condition or input
  const startTime: Date = new Date(); // This could be dynamic based on some condition or input
  const endTime: Date = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // Assuming the tournament ends in 7 days

  if (teamsArray.length < 3) {
    throw new Error("A minimum of 3 teams is required to create a tournament.");
  }
  const teams: TeamWithSeed[] = teamsArray.map((team, index) => ({
    team: team,
    seed: index + 1, // Seed based on the order of the array
  }));

  // Sort teams by seed, ensuring that we handle potential null values
  teams.sort((a, b) => {
    if (a.seed === null) return 1;
    if (b.seed === null) return -1;
    return a.seed - b.seed;
  });

  // Calculate the total number of spots in the first round (next power of two)
  const totalSpots = Math.pow(2, Math.ceil(Math.log2(teams.length)));

  // Calculate the number of byes needed
  const byes = totalSpots - teams.length;

  const rounds: { [roundNumber: number]: Match[] } = {};
  let matches: Match[] = []; // Matches for the current round
  let roundNumber = 1; // Start from round 1

  // Create the first round with matches and byes
  let matchIndex = 0; // To keep track of the match index separately
  for (let i = 0; i < teams.length; i++) {
    // If the current match index is less than the number of byes, this team gets a bye
    if (matchIndex < byes) {
      matches.push({
        teams: [teams[i], null], // Team gets a bye
        bracketType: BracketType.Main,
        result: null,
      });
    } else {
      // Pair the teams for matches
      const team1 = teams[i];
      const team2 = i + 1 < teams.length ? teams[i + 1] : null;
      matches.push({
        teams: [team1, team2], // Pair the teams
        bracketType: BracketType.Main,
        result: null,
      });
      i++; // Increment i to skip the next team since it has been paired with the current one
    }
    matchIndex++; // Increment the match index for each iteration
  }

  rounds[roundNumber] = matches;

  // Continue creating rounds until we have a winner
  while (rounds[Math.max(...Object.keys(rounds).map(Number))].length > 1) {
    roundNumber++;
    const previousRoundMatches = rounds[roundNumber - 1];
    matches = [];

    // Pair up the winners of the previous round for the next round
    for (let i = 0; i < previousRoundMatches.length; i += 2) {
      const team1 =
        roundNumber === 2
          ? !previousRoundMatches[i].teams[1]
            ? previousRoundMatches[i].teams[0]
            : null
          : null;
      const team2 =
        roundNumber === 2 && i + 1 < previousRoundMatches.length
          ? !previousRoundMatches[i + 1].teams[1]
            ? previousRoundMatches[i + 1].teams[0]
            : null
          : null;

      matches.push({
        teams: [team1, team2],
        bracketType: BracketType.Main,
        result: null,
      });
    }

    rounds[roundNumber] = matches;
  }

  // Construct the Tournament object
  const tournament: Tournament = {
    type: tournamentType,
    name: tournamentName,
    startTime,
    endTime,
    teams: teams,
    rounds,
  };

  return tournament;
};

const isSameMatch = (match: Match, matchResult: MatchResult): boolean => {
  return (
    (match.teams[0]?.team?.every((id) =>
      matchResult.winner?.team?.includes(id)
    ) ||
      match.teams[1]?.team?.every((id) =>
        matchResult.winner?.team?.includes(id)
      ) ||
      false) &&
    (match.teams[0]?.team?.every((id) =>
      matchResult.loser?.team?.includes(id)
    ) ||
      match.teams[1]?.team?.every((id) =>
        matchResult.loser?.team?.includes(id)
      ) ||
      false)
  );
};

const updateTournamentWithMatchResult = (
  tournament: Tournament,
  matchResult: MatchResult
): Tournament => {
  let roundNumber;
  for (
    let roundIndex = 1;
    roundIndex <= Object.keys(tournament.rounds).length;
    roundIndex++
  ) {
    if (
      tournament.rounds[roundIndex].some((match) =>
        isSameMatch(match, matchResult)
      )
    ) {
      roundNumber = roundIndex;
      break;
    }
  }
  if (roundNumber === undefined) {
    throw new Error("Round not found for the given match result.");
  }
  const round = tournament.rounds[roundNumber];
  const matchIndex = round.findIndex((match: Match) =>
    isSameMatch(match, matchResult)
  );

  if (matchIndex !== -1) {
    // Update the match result for the current round
    tournament.rounds[roundNumber][matchIndex].result = matchResult;

    // Load the winning team into the next round
    if (roundNumber < Object.keys(tournament.rounds).length) {
      const nextRound = tournament.rounds[roundNumber + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2); // Determine the match slot in the next round
      const nextMatch = nextRound[nextMatchIndex];

      // Determine the position (0 or 1) in the next match for the winning team
      const position = matchIndex % 2 === 0 ? 0 : 1;

      if (nextMatch && matchResult.winner) {
        // Set the winning team in the next match
        nextMatch.teams[position] = {
          team: matchResult.winner.team,
          seed: null, // You might want to calculate the seed for the next round
        };
      }
    }
  } else {
    throw new Error("Match not found in the tournament.");
  }
  return tournament;
};

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

export {
  calculateAllPlayerStats,
  calculateTeamStats,
  aggregateStats,
  createTournamentFromTeams,
  updateTournamentWithMatchResult,
};
