import { useState } from "endr";
import { Profile } from "./App";
import Button from "./Button";

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

  return (
    <div className="absolute top-0 w-screen h-screen flex items-center justify-center bg-transparent z-100">
      <div
        className={`w-1/2 h-full flex flex-col items-center justify-center bg-blue-500 transform -translate-x-full ${
          isReversing ? "animate-slideOutLeft" : "animate-slideInLeft"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="p-4">
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
        <div className="p-4">
          <h1 className="text-white text-4xl font-bold mb-4">Team 2</h1>
          <Warrior profile={selectedProfiles[2]} />
          <Warrior profile={selectedProfiles[3]} />
        </div>
      </div>
      <Button className="absolute top-2 left-2" onClick={handleClose}>
        Back
      </Button>
    </div>
  );
};
