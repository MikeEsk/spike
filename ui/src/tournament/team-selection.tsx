import { Profile } from "../App";
import { useState } from "endr";
import Button from "../Button";

const apiUrl = import.meta.env.VITE_API_URL;

export default ({
  profiles,
  onFinalizeTournament,
  teams,
  setTeams,
}: {
  profiles: Profile[];
  onFinalizeTournament: () => void;
  teams: { seed: number; team: [Profile, Profile?] }[];
  setTeams: (teams: { seed: number; team: [Profile, Profile?] }[]) => void;
}) => {
  const [teamCounter, setTeamCounter] = useState(1);

  const handlePlayerClick = (profile: Profile) => {
    const updatedTeams = [...teams];
    let teamExists = false;

    // Check if the player is already added to any team
    for (const team of updatedTeams) {
      if (team.team.some((member) => member?.id === profile.id)) {
        teamExists = true;
        break;
      }
    }

    if (!teamExists) {
      if (updatedTeams.length < teamCounter) {
        updatedTeams.push({ seed: teamCounter, team: [profile] });
      } else {
        const team = updatedTeams.find((t) => t.seed === teamCounter);
        if (team && team.team.length < 2) {
          team.team.push(profile);
        }
      }
      setTeams(updatedTeams);

      if (
        updatedTeams.find((t) => t.seed === teamCounter)?.team?.length === 2
      ) {
        setTeamCounter(teamCounter + 1);
      }
    }
  };
  return (
    <div className="flex flex-row px-4 sm:px-6 lg:pl-32 py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 w-2/3">
        {profiles.map((profile) => {
          const team = teams.find((team) =>
            team.team.some((p) => +p.id === +profile.id)
          );
          const isSelected = !!team;
          return (
            <div
              key={profile.id}
              className="relative"
              onclick={() => handlePlayerClick(profile)}
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
                  <h5 className="text-sm text-gray-900 dark:text-purple-800 font-bold">
                    {profile.name}
                  </h5>
                </div>
              </div>
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-yellow-300">
                  {team.seed}
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
          <Button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onclick={() => {
              setTeams([]);
              setTeamCounter(1);
            }}
          >
            Reset
          </Button>
        </div>
        {teams.map((team) => (
          <div
            key={team.seed}
            className="flex items-center p-2 bg-blue-300 rounded-md"
          >
            <span className="font-bold text-xl px-2 flex items-center">
              {" "}
              {team.seed}:
            </span>
            <div className="grid grid-cols-2 gap-2 w-full">
              {team.team.map((p) => (
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
              teams[teams.length - 1].team.length === 2
                ? "bg-green-500 hover:bg-green-700"
                : "bg-gray-500"
            } text-white font-bold py-2 px-4 rounded`}
            onclick={() => {
              if (teams[teams.length - 1].team.length === 2) {
                onFinalizeTournament();
              }
            }}
            disabled={teams[teams.length - 1].team.length !== 2}
          >
            Proceed with Selected Teams
          </Button>
        )}
      </div>
    </div>
  );
};
