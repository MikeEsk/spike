import { useEffect, useState } from "endr";
import Button from "./Button";

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
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
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

      {tournaments.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="max-w-sm rounded overflow-hidden shadow-lg"
              onClick={() => onTournamentClick(tournament)}
            >
              {/* <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{tournament.name}</div>
                <p className="text-gray-700 text-base">
                  Players: {tournament.teams.length * 2}
                </p>
                <p className="text-gray-700 text-base">
                  Rounds: {Object.keys(tournament.rounds).length}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  #{tournament.type}
                </span>
              </div> */}
              {tournament}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            No tournaments available. Please create a new tournament.
          </p>
        </div>
      )}
    </div>
  );
}

function NewTournamentForm({ onCreate }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("single");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name.trim() && type) {
      onCreate({ name, type });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create New Tournament
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2">
                <label
                  htmlFor="tournament-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tournament Name
                </label>
                <input
                  type="text"
                  name="tournament-name"
                  id="tournament-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter tournament name"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="tournament-type"
                className="block text-sm font-medium text-gray-700"
              >
                Tournament Type
              </label>
              <select
                id="tournament-type"
                name="tournament-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="single">Single Elimination</option>
                <option value="double">Double Elimination</option>
              </select>
            </div>
            <div className="mt-8">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Tournament
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TeamSelection({ players, onTeamSelected }) {
  const [teams, setTeams] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const handlePlayerClick = (player) => {
    const alreadySelected = selectedPlayers.find((p) => p.id === player.id);
    if (!alreadySelected && selectedPlayers.length < 2) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const confirmTeams = () => {
    if (selectedPlayers.length === 2) {
      const newTeam = { id: teams.length + 1, players: selectedPlayers };
      setTeams([...teams, newTeam]);
      onTeamSelected(newTeam);
      setSelectedPlayers([]);
    }
  };

  return (
    <div className="flex flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {players.map((player) => {
          const isSelected = selectedPlayers.some((p) => p.id === player.id);
          const teamNumber = teams.find((team) =>
            team.players.some((p) => p.id === player.id)
          )?.id;
          return (
            <div
              key={player.id}
              className={`p-4 max-w-sm bg-white rounded-lg border shadow-md sm:p-8 ${
                isSelected
                  ? "bg-gray-200"
                  : "dark:bg-gray-800 dark:border-gray-700"
              }`}
              onClick={() => handlePlayerClick(player)}
            >
              <div className="flex justify-center items-center mb-4">
                <img
                  className="w-24 h-24 rounded-full shadow-lg"
                  src={player.image}
                  alt={player.name}
                />
                {teamNumber && (
                  <span className="absolute mt-2 ml-2 text-xs font-semibold text-white bg-indigo-600 px-2 py-1 rounded-full">
                    {teamNumber}
                  </span>
                )}
              </div>
              <h5 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                {player.name}
              </h5>
            </div>
          );
        })}
      </div>
      <div className="ml-6 w-96">
        <h2 className="text-lg font-bold">Teams</h2>
        {teams.map((team) => (
          <div key={team.id} className="mt-2 p-2 bg-blue-100 rounded-md">
            Team {team.id}: {team.players.map((p) => p.name).join(" & ")}
          </div>
        ))}
        {selectedPlayers.length === 2 && (
          <button
            className="mt-4 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            onClick={confirmTeams}
          >
            Confirm Team
          </button>
        )}
      </div>
    </div>
  );
}

function Bracket({ tournament }) {
  const rounds = Object.keys(tournament.rounds);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-start space-x-12">
        {rounds.map((round, index) => (
          <div key={round} className="flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">Round {round}</h2>
            <div className="flex flex-col space-y-4">
              {tournament.rounds[round].map((match, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <Matchup match={match} />
                  {idx < tournament.rounds[round].length - 1 && (
                    <div className="w-0.5 bg-gray-300 h-8"></div>
                  )}
                </div>
              ))}
            </div>
            {index < rounds.length - 1 && (
              <div className="absolute top-0 h-full w-0.5 bg-gray-400 left-full ml-6"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Matchup({ match }) {
  return (
    <div className="flex items-center space-x-2">
      {match.teams.map((team, index) => (
        <div key={index} className="flex items-center space-x-1">
          {team &&
            team.players.map((player) => (
              <div key={player.id} className="flex items-center space-x-1">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-10 h-10 rounded-full"
                />
                <p className="text-sm">{player.name}</p>
                <span className="text-xs font-semibold">
                  {player.score || 0}
                </span>
              </div>
            ))}
          {index === 0 && match.teams.length > 1 && (
            <span className="font-bold text-lg">VS</span>
          )}
        </div>
      ))}
    </div>
  );
}

function Tournament() {
  const [currentScreen, setCurrentScreen] = useState("list"); // 'list', 'create', 'selectTeams', 'bracket'
  const [tournaments, setTournaments] = useState([]);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [players, setPlayers] = useState([]);

  const handleCreateNewClick = () => {
    setCurrentScreen("create");
  };

  const fetchTournaments = async () => {
    const res = await fetch(`${apiUrl}/pave/tournaments`, {
      method: "GET",
    });
    const data = await res.json();
    setTournaments(data);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const onTournamentClick = (tournament) => {
    setCurrentTournament(tournament);
    setCurrentScreen("bracket");
  };

  const handleCreateTournament = (tournamentData) => {
    const newTournament = {
      ...tournamentData,
      id: tournaments.length + 1,
      teams: [],
      rounds: {},
    };
    setTournaments([...tournaments, newTournament]);
    setCurrentTournament(newTournament);
    setCurrentScreen("selectTeams");
  };

  const handleTeamSelected = (team) => {
    const updatedTournament = {
      ...currentTournament,
      teams: [...currentTournament.teams, team],
    };
    setCurrentTournament(updatedTournament);
    // Continue to team selection until teams are fully populated, then switch to brackets
    if (updatedTournament.teams.length >= 8) {
      // Assuming a tournament requires 8 teams
      setCurrentScreen("bracket");
    }
  };

  return (
    <div className="absolute inset-0 bg-white">
      {currentScreen !== "list" && (
        <Button
          className="absolute top-0 left-0 m-4"
          onClick={() => setCurrentScreen("list")}
        >
          Back
        </Button>
      )}

      {currentScreen === "list" && (
        <TournamentList
          tournaments={tournaments}
          onNewTournamentClick={handleCreateNewClick}
          onTournamentClick={onTournamentClick}
        />
      )}
      {currentScreen === "create" && (
        <NewTournamentForm onCreate={handleCreateTournament} />
      )}
      {currentScreen === "selectTeams" && (
        <TeamSelection players={players} onTeamSelected={handleTeamSelected} />
      )}
      {currentScreen === "bracket" && (
        <Bracket tournament={currentTournament} />
      )}
      {currentScreen !== "list" &&
        currentScreen !== "create" &&
        currentScreen !== "selectTeams" &&
        currentScreen !== "bracket" && <div>Invalid state</div>}
    </div>
  );
}

export default Tournament;
