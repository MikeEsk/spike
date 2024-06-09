export type Team = number[];

export type TeamScore = {
  team: Team;
  score: string;
};

// Interface for a MatchResult
export type MatchResult = {
  winner: TeamScore | null;
  loser: TeamScore | null;
};

// Enum for bracket types
export enum BracketType {
  Main = "Main",
  Losers = "Losers",
}

// Interface for a Tournament
export type Tournament = {
  type: "double" | "single";
  name: string;
  startTime: Date;
  endTime: Date;
  teams: TeamWithSeed[];
  rounds: { [key: number]: Match[] };
};

export type TeamWithSeed = {
  team: Team | null;
  seed: number | null;
};

// Interface for a Match
export type Match = {
  teams: [TeamWithSeed | null, TeamWithSeed | null]; // Pair of teams participating in the match
  result: MatchResult | null; // Optional game result, present only after the match is concluded
  bracketType: BracketType; // Indicates if the match is in the Main or Losers bracket
};
