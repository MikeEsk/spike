import { useEffect, useState, useRef } from "endr";
import Button from "./Button";
import { Profile, Team } from "./App";

import { Tournament, Match } from "./App";

const apiUrl = import.meta.env.VITE_API_URL;

function TournamentList({
  tournaments,
  onNewTournamentClick,
  onTournamentClick,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
        <div className="lg:flex-1">
          <h1 className="text-3xl font-bold leading-tight text-white">
            Tournaments
          </h1>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-3">
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onNewTournamentClick} // Add this line
          >
            Create New Tournament
          </button>
        </div>
      </div>

      {tournaments?.length > 0 ? (
        <div className="flex flex-col p-8 space-y-4">
          {tournaments.map((tournament: Tournament) => (
            <Button
              key={tournament.name}
              className=" max-w-sm rounded overflow-hidden shadow-lg bg-purple-500"
              onClick={() => onTournamentClick(tournament)}
            >
              {tournament}
            </Button>
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-white">
            No tournaments found. Please create a new one.
          </p>
        </div>
      )}
    </div>
  );
}

function NewTournamentForm({
  onCreate,
  tournamentName,
  setTournamentName,
  tournamentType,
  setTournamentType,
}) {
  const tournamentNameInputRef = useRef(null);

  // The inputs onChange isn't firing
  useEffect(() => {
    const handleNameChange = (event) => setTournamentName(event.target.value);
    const inputElement = tournamentNameInputRef.current;
    if (inputElement) {
      inputElement.addEventListener("input", handleNameChange);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("input", handleNameChange);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 text-purple-900 font-bold">
            Create New Tournament
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2">
                <label
                  htmlFor="tournament-name"
                  className="flex text-sm font-lg font-bold text-gray-700"
                >
                  Tournament Name
                </label>
                <input
                  ref={tournamentNameInputRef}
                  type="text"
                  name="tournament-name"
                  id="tournament-name"
                  autoComplete="off"
                  value={tournamentName}
                  placeholder="Enter tournament name"
                  className="mt-3 p-3 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg "
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="tournament-type"
                className="flex text-sm font-lg font-bold text-gray-700"
              >
                Tournament Type
              </label>
              <select
                id="tournament-type"
                name="tournament-type"
                value={tournamentType}
                onChange={(e) => setTournamentType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="single">Single Elimination</option>
                <option value="double">Double Elimination</option>
              </select>
            </div>
            <div className="mt-8">
              <Button
                onClick={onCreate}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Pick Teams
                <strong className="ml-2">→</strong>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSelection({
  profiles,
  onFinalizeTournament,
  teams,
  setTeams,
}: {
  profiles: Profile[];
  onFinalizeTournament: () => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
}) {
  const [teamCounter, setTeamCounter] = useState(1);

  const handlePlayerClick = (player) => {
    const updatedTeams = [...teams];

    if (updatedTeams.length < teamCounter) {
      updatedTeams.push({ id: teamCounter, players: [player] });
    } else {
      updatedTeams[teamCounter - 1].players.push(player);
    }
    setTeams(updatedTeams);

    if (updatedTeams[teamCounter - 1].players.length === 2) {
      setTeamCounter(teamCounter + 1);
    }
  };

  return (
    <div className="flex flex-row px-4 sm:px-6 lg:pl-32 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 w-2/3">
        {profiles.map((profile) => {
          const team = teams.find((team) =>
            team.players.some((p) => p.id === profile.id)
          );
          const isSelected = !!team;
          return (
            <div
              key={profile.id}
              className="relative"
              onClick={() => handlePlayerClick(profile)}
              style={{ aspectRatio: "1 / 1" }}
            >
              <div
                className={`relative w-full h-full ${
                  isSelected ? "opacity-30" : ""
                }`}
              >
                <img
                  className="w-full h-full rounded-md shadow-md object-cover"
                  src={`${apiUrl}/pave/profilepics/${profile.name.toLowerCase()}`}
                  alt={profile.name}
                />
                <div className="absolute bottom-0 right-0 bg-yellow-300 rounded-tl-lg p-1">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-purple-800 font-bold">
                    {profile.name}
                  </h5>
                </div>
              </div>
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-yellow-300">
                  {team.id}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col ml-6 w-96 space-y-4">
        <div className="flex text-lg space-x-24 font-bold text-orange-500 underline">
          <h2>Seed</h2>
          <h2>Team</h2>
        </div>
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center p-2 bg-blue-300 rounded-md"
          >
            <span className="font-bold text-xl px-2 flex items-center">
              {" "}
              {team.id}:
            </span>
            <div className="grid grid-cols-2 gap-2 w-full">
              {team.players.map((p) => (
                <div
                  key={p.id}
                  className="p-1 bg-white font-bold rounded shadow flex items-center justify-center"
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        ))}
        {teams.length >= 3 && (
          <Button
            className={`h-24 ${
              teams[teams.length - 1].players.length === 2
                ? "bg-green-500 hover:bg-green-700"
                : "bg-gray-500"
            } text-white font-bold py-2 px-4 rounded`}
            onClick={() => {
              if (teams[teams.length - 1].players.length === 2) {
                onFinalizeTournament(teams);
              }
            }}
            disabled={teams[teams.length - 1].players.length !== 2}
          >
            Proceed with Selected Teams
          </Button>
        )}
      </div>
    </div>
  );
}

const Bracket = ({
  tournament,
  profiles,
  openThunderDome,
}: {
  tournament: Tournament;
  profiles: Profile[];
  openThunderDome: (match: Match) => void;
}) => {
  if (!tournament) return null;
  const rounds = Object.keys(tournament.rounds).map(Number);
  return (
    <div className="flex flex-1 bg-purple-800 h-[200%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-1 justify-around space-x-12 ">
        {rounds.map((round) => (
          <div key={round} className="flex flex-col items-center h-full w-64">
            <h2 className="text-lg text-yellow-300 font-bold mb-4">
              Round {round}
            </h2>
            <div className="flex flex-col justify-around h-full w-full">
              {tournament.rounds[round].map((match, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <Matchup
                    match={match}
                    profiles={profiles}
                    onClick={() => openThunderDome(match)}
                    roundNumber={round}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const isSameTeam = (teamA: number[], teamB: number[]) =>
  teamA.every((id, index) => id === teamB[index]);

const Matchup = ({
  match,
  profiles,
  onClick,
  roundNumber,
}: {
  match: Match;
  profiles: Profile[];
  onClick: () => void;
  roundNumber: number;
}) => {
  return (
    <div
      className="flex flex-col bg-white shrink-0 items-center border rounded-lg h-36 w-full divide-y divide-black shadow-xl cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {match.teams.map((team, index) => (
        <div
          key={index}
          className="flex flex-1 items-center space-x-1 w-full justify-between"
        >
          {team?.team ? (
            <>
              <div className="flex flex-1">
                <div className="text-lg font-bold self-center text-center px-2">
                  {team.seed}
                </div>
                {team.team.map((playerId) => {
                  const player = profiles.find(
                    (profile) => +profile.id === playerId
                  );

                  return (
                    <div
                      key={playerId}
                      className="flex flex-col grow items-center space-x-1 px-2 py-1"
                    >
                      <img
                        src={`${apiUrl}/pave/profilepics/${player?.name.toLowerCase()}`}
                        alt={player?.name}
                        className="w-10 h-10 border border-gray-300 rounded-lg"
                      />
                      <p className="text-sm">{player?.name}</p>
                    </div>
                  );
                })}
              </div>
              <div
                className={`text-lg font-bold px-2 py-1 border-l-2 h-full w-12 ${
                  match.teams[0] && match.teams[1] && !match.result
                    ? "bg-gray-200"
                    : match.result &&
                      (isSameTeam(match.result.winner?.team, team.team)
                        ? "bg-green-300"
                        : "bg-red-300")
                }`}
              >
                {match.result?.winner?.team &&
                isSameTeam(match.result?.winner?.team, team.team)
                  ? match.result.winner.score
                  : match.result?.loser?.score}
              </div>
            </>
          ) : (
            <div className="flex font-bold flex-1 w-full justify-center text-gray-500">
              {roundNumber === 1 ? "BYE" : ""}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ({
  onClose,
  profiles,
  openThunderDome,
  fetchTournaments,
  tournaments,
  setTournaments,
  currentTournament,
  setCurrentTournament,
}: {
  onClose: () => void;
  profiles: Profile[];
  openThunderDome: (match: Match) => void;
  fetchTournaments: () => Promise<void>;
  tournaments: Tournament[];
  setTournaments: (tournaments: Tournament[]) => void;
  currentTournament: Tournament | null;
  setCurrentTournament: (tournament: Tournament | null) => void;
}) => {
  const [currentScreen, setCurrentScreen] = useState("list"); // 'list', 'create', 'selectTeams', 'bracket'
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentType, setTournamentType] = useState("single");
  const [teams, setTeams] = useState([]);

  const handleCreateNewClick = () => {
    setCurrentScreen("create");
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const onTournamentClick = (tournament) => {
    setCurrentScreen("bracket");

    fetch(`${apiUrl}/pave/tournament`, {
      method: "POST",
      body: JSON.stringify({ name: tournament }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => res.json())
      .then((data) => setCurrentTournament(data))
      .catch((error) => console.error("Error posting tournament:", error));
  };

  const handleCreateTournament = async () => {
    setCurrentScreen("selectTeams");
  };

  const handleFinalizeTournament = async () => {
    await fetch(`${apiUrl}/pave/createTournament`, {
      method: "POST",
      body: JSON.stringify({
        name: tournamentName,
        teams: teams.map((team) => [team.players[0].id, team.players[1].id]),
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => res.json())
      .then((data) => setCurrentTournament(data))
      .catch((error) => console.error("Error posting tournament:", error));

    setCurrentScreen("bracket");
  };

  return (
    <div className="absolute inset-0 bg-purple-800 flex grow">
      <Button
        className="absolute top-0 left-0 m-4"
        onClick={
          currentScreen === "list"
            ? onClose
            : currentScreen === "selectTeams"
            ? () => setCurrentScreen("create")
            : () => setCurrentScreen("list")
        }
      >
        Back
      </Button>

      {currentScreen === "list" && (
        <TournamentList
          tournaments={tournaments}
          onNewTournamentClick={handleCreateNewClick}
          onTournamentClick={onTournamentClick}
        />
      )}
      {currentScreen === "create" && (
        <NewTournamentForm
          onCreate={handleCreateTournament}
          tournamentName={tournamentName}
          setTournamentName={setTournamentName}
          tournamentType={tournamentType}
          setTournamentType={setTournamentType}
        />
      )}
      {currentScreen === "selectTeams" && (
        <TeamSelection
          profiles={profiles}
          onFinalizeTournament={handleFinalizeTournament}
          teams={teams}
          setTeams={setTeams}
        />
      )}
      {currentScreen === "bracket" && (
        <Bracket
          tournament={currentTournament}
          profiles={profiles}
          openThunderDome={openThunderDome}
        />
      )}
      {currentScreen !== "list" &&
        currentScreen !== "create" &&
        currentScreen !== "selectTeams" &&
        currentScreen !== "bracket" && <div>Invalid state</div>}
    </div>
  );
};
