import { useEffect, useState } from "endr";
import Button from "../Button";
import { Profile } from "../App";

import { Tournament, Match } from "../App";
import TeamSelection from "./team-selection";
import Bracket from "./bracket";
import NewTournament from "./new-tournament";

const apiUrl = import.meta.env.VITE_API_URL;

function TournamentList({
  tournaments,
  onNewTournamentClick,
  onTournamentClick,
  profiles,
}) {
  return (
    <div className="max-w-7xl mx-auto px-8 space-x-8 sm:px-6 lg:px-36">
      <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
        <div className="lg:flex-1">
          <h1 className="text-3xl font-bold leading-tight text-white">
            Tournaments
          </h1>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-3">
          <Button
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onclick={onNewTournamentClick} // Add this line
          >
            Create New Tournament
          </Button>
        </div>
      </div>

      <div className="py-4 space-y-4">
        <h2 className="text-2xl font-bold leading-tight text-white">Active</h2>

        {tournaments?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {tournaments.map((tournament: Tournament) => {
              const lastRound =
                tournament.rounds[
                  Math.max(...Object.keys(tournament.rounds).map(Number))
                ];
              const lastMatch = lastRound[lastRound.length - 1];
              const isCompleted = !!lastMatch.result?.winner;

              return isCompleted ? null : (
                <Button
                  key={tournament.name}
                  className="rounded flex w-full h-16 overflow-hidden shadow-lg bg-purple-500 font-bold text-xl"
                  onclick={() => onTournamentClick(tournament)}
                >
                  <div className="mr-auto"> {tournament.name}</div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-white">
              No tournaments found. Please create a new one.
            </p>
          </div>
        )}
      </div>

      <div className="py-4 space-y-4">
        <h2 className="text-xl font-bold leading-tight text-white">
          Completed
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {tournaments.map((tournament: Tournament) => {
            const lastRound =
              tournament.rounds[
                Math.max(...Object.keys(tournament.rounds).map(Number))
              ];
            const lastMatch = lastRound[lastRound.length - 1];
            const isCompleted = !!lastMatch.result?.winner;

            if (!isCompleted) return null;

            return (
              <Button
                key={tournament.name}
                className="flex justify-between rounded overflow-hidden shadow-lg bg-green-500 p-4"
                onclick={() => onTournamentClick(tournament)}
              >
                <h3 className="text-lg font-bold">{tournament.name}</h3>
                <div className="flex space-x-2">
                  {lastMatch.result?.winner.team.map((member, index) => (
                    <img
                      key={index}
                      src={`${apiUrl}/pave/profilepics/${profiles
                        .find((profile) => profile.id === member)
                        .name.toLowerCase()}`}
                      alt={`Winner ${index + 1}`}
                      className="h-10 w-10 rounded-full"
                    />
                  ))}
                </div>
              </Button>
            );
          })}
        </div>
      </div>
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
  const [teams, setTeams] = useState<
    { seed: number; team: [Profile, Profile?] }[]
  >([]);

  const handleCreateNewClick = () => {
    setCurrentScreen("create");
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const onTournamentClick = (tournament) => {
    setCurrentScreen("bracket");
    const foundTournament = tournaments.find((t) => t.name === tournament.name);
    setCurrentTournament(foundTournament || null);
  };

  const handleCreateTournament = async () => {
    setCurrentScreen("selectTeams");
  };

  const handleFinalizeTournament = async () => {
    await fetch(`${apiUrl}/pave/createTournament`, {
      method: "POST",
      body: JSON.stringify({
        name: tournamentName,
        teams: teams.map((team) => [team.team[0].id, team.team[1].id]),
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCurrentTournament(data);
        setTeams([]);
        setTournamentName(null);
      })
      .catch((error) => console.error("Error posting tournament:", error));

    setCurrentScreen("bracket");
  };

  return (
    <div className="absolute inset-0 bg-purple-800  ">
      <Button
        className="absolute top-0 left-0 m-4"
        onclick={() => {
          if (currentScreen === "list") {
            onClose();
          } else if (currentScreen === "selectTeams") {
            setCurrentScreen("create");
          } else {
            setTeams([]);
            setTournamentName(null);
            fetchTournaments();
            setCurrentScreen("list");
          }
        }}
      >
        Back
      </Button>

      {currentScreen === "list" && (
        <TournamentList
          tournaments={tournaments}
          onNewTournamentClick={handleCreateNewClick}
          onTournamentClick={onTournamentClick}
          profiles={profiles}
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
