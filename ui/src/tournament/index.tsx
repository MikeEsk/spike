import { useEffect, useState } from "endr";
import Button from "../button";
import { Profile } from "../app";

import { Tournament, Match } from "../app";
import TeamSelection from "./team-selection";
import Bracket from "./bracket";
import NewTournament from "./new-tournament";

const apiUrl = import.meta.env.VITE_API_URL;

function TournamentList({
  tournaments,
  onNewTournamentClick,
  onTournamentClick,
}) {
  return (
    <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-36">
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
    <div className="absolute inset-0 bg-purple-800  ">
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
        <NewTournament
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
