import {
  Team,
  Tournament,
  TeamWithSeed,
  Match,
  BracketType,
  MatchResult,
} from "../types";

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

export { createTournamentFromTeams, updateTournamentWithMatchResult };
