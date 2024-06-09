import Home from "./Home";
import { useEffect, useState } from "endr";
import ThunderDome from "./ThunderDome";
import Stats from "./Stats";
import Tournament, { Match } from "./Tournament";
import Bell from "./assets/bell.mp3";

export type Profile = {
  id: string;
  name: string;
};

export type Scores = {
  winner: { team: string[]; score?: number };
  loser: { team: string[]; score?: number };
} | null;

const apiUrl = import.meta.env.VITE_API_URL;

const createGame = async ({ query }) => {
  const response = await fetch(`${apiUrl}/pave/createGame`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ data: query }),
  });

  return response.json();
};

const updatedTournamentGame = async ({ query }) => {
  const response = await fetch(`${apiUrl}/pave/updateTournament`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ data: query }),
  });

  return response.json();
};

export type GameState = {
  selectedProfiles: Profile[];
  profiles: Profile[];
  loadGame: boolean;
  isRandom: boolean;
};

export type Team = number[];

export type TeamScore = {
  team: Team;
  score: string;
};

// type for a MatchResult
export type MatchResult = {
  winner: TeamScore | null;
  loser: TeamScore | null;
};

// Enum for bracket types
enum BracketType {
  Main = "Main",
  Losers = "Losers",
}

// type for a Tournament
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

// type for a Match
export type Match = {
  teams: [TeamWithSeed | null, TeamWithSeed | null]; // Pair of teams participating in the match
  result: MatchResult | null; // Optional game result, present only after the match is concluded
  bracketType: BracketType; // Indicates if the match is in the Main or Losers bracket
};

export default () => {
  const [state, setState] = useState<GameState>({
    selectedProfiles: [],
    profiles: [],
    loadGame: false,
    isRandom: false,
  });

  const [showStats, setShowStats] = useState(false);
  const [showTournament, setShowTournament] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState(null);

  const fetchTournaments = async () => {
    const res = await fetch(`${apiUrl}/pave/tournaments`, {
      method: "GET",
    });
    const data = await res.json();
    setTournaments(data);
  };

  const onClose = () => {
    setState((prev) => ({
      ...prev,
      selectedProfiles: [],
      loadGame: false,
      isRandom: false,
    }));
  };

  const onCompleteGame = async ({ scores, rematch = false }) => {
    if (currentTournament) {
      await updatedTournamentGame({
        query: {
          tournamentName: currentTournament.name,
          scores: scores,
        },
      });
      setState((prev) => ({
        ...prev,
        selectedProfiles: [],
        loadGame: false,
      }));
      return;
    }

    if (scores) {
      await createGame({
        query: {
          createGame: {
            $: { scores },
            games: { id: {}, winner: {}, loser: {} },
          },
        },
      });

      if (rematch) {
        setState((prev) => ({
          ...prev,
          isRandom: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          selectedProfiles: [],
          loadGame: false,
        }));
      }
    } else {
      alert("Something went wrong");
    }
  };

  const openThunderDome = (match: Match) => {
    if (match.teams[0]?.team && match.teams[1]?.team) {
      const audio = new Audio(Bell);
      audio.play();
      setState((prev) => ({
        ...prev,
        selectedProfiles: match.teams.flatMap(
          (team) =>
            (team &&
              team.team?.map((playerId) =>
                state.profiles.find((profile) => profile.id === playerId)
              )) ??
            []
        ),
        loadGame: true,
      }));
    }
  };

  const onOpenStats = () => {
    fetchStats();
    setShowStats(true);
  };

  const onOpenTournament = () => {
    setShowTournament(true);
  };

  const fetchData = async () => {
    const res = await fetch(`${apiUrl}/pave/profiles`, {
      method: "GET",
    });
    const data = await res.json();
    setState((prev) => ({ ...prev, profiles: data }));
  };

  const fetchStats = async () => {
    const res = await fetch(`${apiUrl}/pave/stats`, {
      method: "GET",
    });
    const data = await res.json();
    setState((prev) => ({ ...prev, stats: data }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const shuffleProfiles = (profiles) => {
    for (let i = profiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [profiles[i], profiles[j]] = [profiles[j], profiles[i]]; // ES6 destructuring swap
    }
    return profiles;
  };

  if (state.profiles.length === 0) return <h1>...Loading</h1>;

  return (
    <div className="flex grow">
      <Home
        state={state}
        addProfile={({ profile }) =>
          setState((prev) => ({
            ...prev,
            selectedProfiles: [...state.selectedProfiles, profile],
          }))
        }
        startThunderDome={() =>
          setState((prev) => ({
            ...prev,
            selectedProfiles: state.isRandom
              ? shuffleProfiles([...prev.selectedProfiles])
              : [...prev.selectedProfiles],
            loadGame: true,
          }))
        }
        onRandomize={() =>
          setState((prev) => ({ ...prev, isRandom: !prev.isRandom }))
        }
        onClearProfiles={() =>
          setState((prev) => ({ ...prev, selectedProfiles: [] }))
        }
        onOpenStats={onOpenStats}
        onOpenTournament={onOpenTournament}
        statsIsLoading={showStats && !state.stats?.data}
      />
      {showStats && state.stats && (
        <Stats data={state.stats} onCloseStats={() => setShowStats(false)} />
      )}

      {showTournament && (
        <Tournament
          onClose={() => {
            setShowTournament(false);
            setCurrentTournament(null);
          }}
          profiles={state.profiles}
          openThunderDome={openThunderDome}
          fetchTournaments={fetchTournaments}
          tournaments={tournaments}
          setTournaments={setTournaments}
          currentTournament={currentTournament}
          setCurrentTournament={setCurrentTournament}
        />
      )}
      {state.loadGame && (
        <ThunderDome
          selectedProfiles={state.selectedProfiles}
          onClose={onClose}
          onCompleteGame={onCompleteGame}
          currentTournament={currentTournament}
        />
      )}
    </div>
  );
};
