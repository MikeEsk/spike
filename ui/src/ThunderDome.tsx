import { useState } from "endr";
import { Profile } from "./App";
import Button from "./Button";

import { Scores } from "./App";

const apiUrl = import.meta.env.VITE_API_URL;

const Keypad = ({ type, onComplete, onClose, slideDirection = "up" }) => {
  const [input, setInput] = useState("");
  const slideInClass =
    slideDirection === "left" ? "animate-slideInLeft" : "animate-slideInUp";
  const baseClass =
    "fixed top-0 left-0 bottom-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50";

  return (
    <div className={`${baseClass} ${slideInClass}`}>
      <div className="relative bg-white p-8 rounded-lg shadow-lg">
        <button onClick={onClose} className="absolute top-2 right-2 text-3xl">
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {type === "winner" ? "Winner" : "Loser"}'s score
        </h2>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="text-center text-3xl p-4 bg-gray-100 w-full mb-4"
        />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }, (_, i) => i).map((num) => (
            <button
              key={num + 1}
              className="bg-blue-500 text-white text-2xl p-3 rounded hover:bg-blue-700 transition"
              onClick={() => setInput(input + (num + 1))}
            >
              {num + 1}
            </button>
          ))}
        </div>
        <div className="w-full flex justify-center py-2 space-x-2">
          <button
            key={0}
            className="w-full bg-blue-500 text-white text-2xl p-3 rounded hover:bg-blue-700 transition"
            onClick={() => setInput(input + 0)}
          >
            0
          </button>
          <button
            className="bg-yellow-300 text-white text-2xl p-3 rounded hover:bg-gray-700 transition"
            onClick={() => setInput(input.slice(0, -1))}
          >
            ←
          </button>
        </div>
        <div className="flex space-x-2.5">
          {!type && (
            <button
              className=" bg-orange-500 text-white p-2 rounded-full w-full hover:bg-green-700 transition"
              onClick={() =>
                input && onComplete({ score: input, rematch: true })
              }
            >
              Complete & Rematch ♻️
            </button>
          )}

          <button
            className=" bg-green-500 text-white p-2 rounded-full w-full hover:bg-green-700 transition"
            onClick={() => input && onComplete({ score: input })}
          >
            {!type ? "Complete" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Warrior = ({ profile }: { profile: Profile }) => (
  <div className="p-4">
    <img
      className="h-[16rem] rounded-xl shadow-md shadow-slate-600"
      key={profile.id}
      src={`${apiUrl}/pave/profilepics/${profile.name.toLowerCase()}`}
      alt={profile.name}
    />
  </div>
);

export default ({
  selectedProfiles,
  onCompleteGame,
  onClose,
}: {
  selectedProfiles: Profile[];
  onClose: () => void;
  onCompleteGame: ({
    scores,
    rematch,
  }: {
    scores: Scores;
    rematch: boolean;
  }) => void;
}) => {
  const [isReversing, setIsReversing] = useState(false);

  const handleAnimationEnd = () => isReversing && setIsReversing(false);

  const [scoreState, setScoreState] = useState<Scores>(null);

  const handleScoreEntry = ({
    winnerTeam,
    loserTeam,
    score,
    rematch,
  }: {
    winnerTeam: string[];
    loserTeam: string[];
    score?: number;
    rematch: boolean;
  }) => {
    setScoreState((prev) => {
      if (!prev) {
        return {
          winner: { team: winnerTeam },
          loser: { team: loserTeam },
        };
      } else if (prev.winner && !prev.winner.score) {
        return {
          ...prev,
          winner: { team: prev.winner.team, score },
        };
      } else {
        onCompleteGame({
          scores: { ...prev, loser: { team: prev.loser.team, score } },
          rematch,
        });
        if (!rematch) {
          setIsReversing(true);
          handleAnimationEnd();
        }
      }
    });
  };

  return (
    <div className="fixed top-0 w-screen h-screen flex items-center justify-center bg-transparent z-100">
      <div
        className={`w-1/2 h-full flex flex-col items-center justify-center bg-blue-500 transform -translate-x-full ${
          isReversing ? "animate-slideOutLeft" : "animate-slideInLeft"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div
          className="p-4"
          onClick={() =>
            handleScoreEntry({
              winnerTeam: [selectedProfiles[0].id, selectedProfiles[1].id],
              loserTeam: [selectedProfiles[2].id, selectedProfiles[3].id],
            })
          }
        >
          <h1 className="text-white text-4xl font-bold mb-4">Team 1</h1>
          <Warrior profile={selectedProfiles[0]} />
          <Warrior profile={selectedProfiles[1]} />
        </div>
      </div>

      <div
        className={`w-1/2 h-full flex flex-col items-center justify-center bg-red-500 transform translate-x-full ${
          isReversing ? "animate-slideOutRight" : "animate-slideInRight"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div
          className="p-4"
          onClick={() =>
            handleScoreEntry({
              winnerTeam: [selectedProfiles[2].id, selectedProfiles[3].id],
              loserTeam: [selectedProfiles[0].id, selectedProfiles[1].id],
            })
          }
        >
          <h1 className="text-white text-4xl font-bold mb-4">Team 2</h1>
          <Warrior profile={selectedProfiles[2]} />
          <Warrior profile={selectedProfiles[3]} />
        </div>
      </div>
      {scoreState?.winner && !scoreState?.winner.score && (
        <Keypad
          type="winner"
          onComplete={handleScoreEntry}
          onClose={() => setScoreState(null)}
        />
      )}
      {scoreState?.winner?.score && (
        <Keypad
          onComplete={handleScoreEntry}
          onClose={() => setScoreState(null)}
          slideDirection="left"
        />
      )}
      <Button className="absolute top-2 left-2" onClick={onClose}>
        Back
      </Button>
    </div>
  );
};
