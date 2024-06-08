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
  const response = await fetch(`${apiUrl}/pave`, {
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

export default () => {
  const [state, setState] = useState<GameState>({
    selectedProfiles: [],
    profiles: [],
    loadGame: false,
    isRandom: false,
  });

  const [showStats, setShowStats] = useState(true);
  const [showTournament, setShowTournament] = useState(false);

  const onClose = () => {
    setState((prev) => ({
      ...prev,
      selectedProfiles: [],
      loadGame: false,
      isRandom: false,
    }));
  };

  const onCompleteGame = async ({ scores, rematch = false }) => {
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
            (team && team.team?.map((playerId) => state.profiles[playerId])) ??
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
      />
      {showStats && state.stats && (
        <Stats data={state.stats} onCloseStats={() => setShowStats(false)} />
      )}

      {showTournament && (
        <Tournament
          onClose={() => setShowTournament(false)}
          profiles={state.profiles}
          openThunderDome={openThunderDome}
        />
      )}
      {state.loadGame && (
        <ThunderDome
          selectedProfiles={state.selectedProfiles}
          onClose={onClose}
          onCompleteGame={onCompleteGame}
        />
      )}
    </div>
  );
};
