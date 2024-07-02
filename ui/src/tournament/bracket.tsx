import { Match, Profile, Tournament } from "../App";

const isSameTeam = (teamA: number[], teamB: number[]) =>
  teamA.every((id, index) => id === teamB[index]);

const apiUrl = import.meta.env.VITE_API_URL;

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
      onclick={onClick}
    >
      {match.teams.map((team, index) => (
        <div
          key={index}
          className="flex flex-1 items-center w-full justify-between"
        >
          {team?.team ? (
            <>
              <div
                className={`flex flex-1 ${
                  match.result &&
                  isSameTeam(match.result.loser?.team, team.team)
                    ? "bg-gray-200 opacity-50"
                    : ""
                }`}
              >
                <div className="text-lg font-bold self-center text-center px-4">
                  {team.seed}
                </div>
                {team.team.map((playerId) => {
                  const player = profiles.find(
                    (profile) => +profile.id === playerId
                  );

                  return (
                    <div
                      key={playerId}
                      className="flex flex-col grow items-center pt-2 py-1"
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
                className={`text-lg font-bold h-full w-12 flex items-center justify-center ${
                  match.teams[0] && match.teams[1] && !match.result
                    ? "bg-gray-200"
                    : match.result &&
                      (isSameTeam(match.result.winner?.team, team.team)
                        ? "bg-green-300 text-green-700"
                        : "bg-red-300 text-red-700")
                }`}
              >
                {match.result?.winner?.team &&
                isSameTeam(match.result?.winner?.team, team.team)
                  ? match.result.winner.score
                  : match.result?.loser?.score}
              </div>
            </>
          ) : (
            <div
              className={`flex font-bold flex-1 h-full w-full items-center justify-center text-gray-500 ${
                roundNumber === 1 ? "bg-gray-200 opacity-50" : ""
              }`}
            >
              {roundNumber === 1 ? "BYE" : ""}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ({
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
    <>
      <div className="w-full">
        <h1 className="text-xl text-center text-white py-2">
          Tournament: <strong>{tournament.name}</strong>
        </h1>
      </div>
      <div className="flex flex-1 bg-purple-800 mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex flex-1 justify-around space-x-12">
          {rounds.map((round) => (
            <div key={round} className="flex flex-col items-center h-full w-64">
              <h2 className="text-lg text-yellow-300 font-bold mb-4">
                Round {round}
              </h2>
              <div className="flex flex-col justify-around h-full w-full space-y-4">
                {tournament.rounds[round].map((match, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <Matchup
                      match={match}
                      profiles={profiles}
                      onClick={() => {
                        if (!match.result) openThunderDome(match);
                      }}
                      roundNumber={round}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
