import { useState } from "endr";
import { Profile } from "./App";
import Button from "./Button";

const Keypad = ({ type, onComplete, onClose, slideDirection = "up" }) => {
  const [input, setInput] = useState("");
  const slideInClass =
    slideDirection === "left" ? "animate-slideInLeft" : "animate-slideInUp";
  const baseClass =
    "absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50";

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
          {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className="bg-blue-500 text-white text-2xl p-3 rounded hover:bg-blue-700 transition"
              onClick={() => setInput(input + num)}
            >
              {num}
            </button>
          ))}
        </div>
        <button
          className="mt-4 bg-green-500 text-white p-2 rounded-full w-full hover:bg-green-700 transition"
          onClick={() => onComplete({ score: input })}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const Warrior = ({ profile }: { profile: Profile }) => (
  <div className="p-4">
    <img
      className="h-[16rem] rounded-xl shadow-md shadow-slate-600"
      key={profile.id}
      src={profile.imageUrl}
      alt={profile.name}
    />
  </div>
);

export default ({
  selectedProfiles,
  setSelectedProfiles,
  setLoadThunderdome,
}: {
  selectedProfiles: Profile[];
  setSelectedProfiles: (set: []) => void;
  setLoadThunderdome: (set: boolean) => void;
}) => {
  const [isReversing, setIsReversing] = useState(false);

  const handleClose = () => {
    setIsReversing(true); // Start reversing the animations
  };

  const handleAnimationEnd = () => {
    if (isReversing) {
      setLoadThunderdome(false);
      setSelectedProfiles([]);
      setIsReversing(false);
    }
  };

  const [scoreState, setScoreState] = useState<{
    winner?: { team: string; score?: string };
    loser?: { team: string; score: string };
  } | null>(null);

  const handleScoreEntry = ({ team, score }) => {
    setScoreState((prev) => {
      if (!prev) {
        return { winner: { team } };
      } else if (prev.winner && !prev.winner.score) {
        return {
          ...prev,
          winner: { team: prev.winner.team, score },
        };
      } else {
        return { ...prev, loser: { team, score } };
      }
    });

    if (
      scoreState &&
      scoreState.winner &&
      scoreState.winner.score &&
      !scoreState.loser
    ) {
      setIsReversing(true);
      handleAnimationEnd();
    }
  };

  return (
    <div className="absolute top-0 w-screen h-screen flex items-center justify-center bg-transparent z-100">
      <div
        className={`w-1/2 h-full flex flex-col items-center justify-center bg-blue-500 transform -translate-x-full ${
          isReversing ? "animate-slideOutLeft" : "animate-slideInLeft"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="p-4" onClick={() => handleScoreEntry({ team: 1 })}>
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
        <div className="p-4" onClick={() => handleScoreEntry({ team: 2 })}>
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
      <Button className="absolute top-2 left-2" onClick={handleClose}>
        Back
      </Button>
    </div>
  );
};
