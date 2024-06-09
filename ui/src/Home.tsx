import { useEffect, useState } from "endr";
import JTLogo from "./assets/jtlogo.png";
import Bell from "./assets/bell.mp3";
import SpikeLogo from "./assets/spikelogo.png";
import Button from "./button";
import { GameState, Profile } from "./app";

const apiUrl = import.meta.env.VITE_API_URL;

const ProfileTile = ({
  profile,
  itemCount,
  index,
  onClick,
  size,
}: {
  profile: Profile;
  index: number;
  onClick: () => void;
  itemCount: number;
  size: { width: number; height: number };
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const handlePointerDown = () => setIsPressed(true);
  const handlePointerUp = () => setIsPressed(false);

  return (
    <div
      className={`absolute w-[5rem] p-1 items-center justify-center ${
        isPressed && "w-[4.8rem]"
      }`}
      style={{
        left: `calc(50% + ${
          Math.cos((2 * Math.PI * index) / itemCount) * size.width
        }px)`,
        top: `calc(50% + ${
          Math.sin((2 * Math.PI * index) / itemCount) * size.height
        }px)`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <img
        className={`animate-ccw-spin rounded-xl shadow-md shadow-slate-600 ${
          isPressed && "shadow-sm"
        }`}
        key={profile.id}
        src={`${apiUrl}/pave/profilepics/${profile.name.toLowerCase()}`}
        alt={profile.name}
        onClick={onClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
};

const initialRadius = 120;

export default ({
  state,
  addProfile,
  startThunderDome,
  onRandomize,
  onClearProfiles,
  onOpenStats,
  onOpenTournament,
  statsIsLoading,
}: {
  state: GameState;
  addProfile: ({ profile }: { profile: Profile }) => void;
  startThunderDome: () => void;
  onRandomize: () => void;
  onClearProfiles: () => void;
  showStats: boolean;
  onOpenStats: () => void;
  onOpenTournament: () => void;
  statsIsLoading: boolean;
}) => {
  const [size, setSize] = useState({
    width: window.innerWidth / 2,
    height: window.innerHeight / 2,
  });
  const [radius, setRadius] = useState(initialRadius); // Initial radius
  const [expanding, setExpanding] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerHeight / 2.5,
        height: window.innerHeight / 2.5,
      });
    };
    window.addEventListener("resize", updateSize);
    updateSize();
  }, []);

  useEffect(() => {
    let interval;
    const duration = 4500; // 4.5 seconds total duration
    const steps = 1000;
    const stepDuration = duration / steps;
    const maxRadius = 800;
    const growthFactor = Math.pow(maxRadius / radius / 2, 1.5 / steps);

    if (expanding) {
      interval = setInterval(() => {
        setRadius((currentRadius) => {
          const newRadius = currentRadius * growthFactor;
          if (newRadius >= maxRadius) {
            clearInterval(interval);
            setExpanding(false);
            return initialRadius;
          }
          return newRadius;
        });
      }, stepDuration);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [expanding]);

  const handleProfileClick = async (profile: Profile) => {
    if (
      state.selectedProfiles.length < 4 &&
      !state.selectedProfiles.includes(profile)
    ) {
      addProfile({ profile });
    }

    const audio = new Audio(
      `${apiUrl}/pave/playeraudio/${profile.name.toLowerCase()}`
    );
    audio.play();

    if (state.selectedProfiles.length === 3) {
      setTimeout(() => setExpanding(true), 500);
      setTimeout(() => {
        const audio = new Audio(Bell);
        audio.play();
        startThunderDome();
      }, 4000);
    }
  };

  return (
    <div className="flex overflow-hidden ">
      <div className="w-1/6 min-w-0 p-4 bg-purple-700">
        <img
          onClick={() => window.location.reload()}
          src={SpikeLogo}
          className="w-full"
        />
      </div>

      <div className="relative h-screen w-3/4 items-center justify-center">
        <div className="flex h-screen self-center animate-cw-spin">
          {state.profiles.map((profile, index) => (
            <ProfileTile
              profile={profile}
              itemCount={state.profiles.length}
              index={index}
              onClick={() => handleProfileClick(profile)}
              size={size}
            />
          ))}
        </div>

        <div className="absolute flex w-full h-full top-0 right-0 items-center justify-center pointer-events-none">
          <div
            className={`relative flex h-24 w-24 rounded-full ${
              state.selectedProfiles.length === 4 && "animate-exp-spin"
            }`}
            style={{
              backgroundImage: `url(${JTLogo})`,
              backgroundSize: "cover",
            }}
          >
            {state.selectedProfiles.length > 0 &&
              state.selectedProfiles.length !== 4 && (
                <Button
                  className="absolute px-[0.7rem] py-[0.3rem] -bottom-1 -right-1 text-xl pointer-events-auto opacity-80"
                  onClick={onClearProfiles}
                >
                  &times;
                </Button>
              )}
            {state.selectedProfiles.map((profile, index) => (
              <img
                key={profile.id}
                src={`${apiUrl}/pave/profilepics/${profile.name.toLowerCase()}`}
                alt={profile.name}
                className="absolute w-18 h-18 rounded-3xl shadow-lg shadow-slate-600"
                style={{
                  left: `calc(50% + ${
                    radius * Math.cos((2 * Math.PI * index) / 4)
                  }px)`,
                  top: `calc(50% + ${
                    radius * Math.sin((2 * Math.PI * index) / 4)
                  }px)`,
                  transform: "translate(-50%, -50%)",
                  ...(!state.isRandom && {
                    boxShadow: `${
                      index < 2 ? "0px 0px 30px blue" : "0px 0px 30px red"
                    }`,
                  }),
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col w-1/6 bg-purple-700 p-4 space-y-4">
        <Button
          onClick={onRandomize}
          className={state.isRandom ? "bg-green-500" : ""}
        >
          Random
        </Button>

        <Button onClick={onOpenStats} className="bg-orange-500 text-white">
          {statsIsLoading ? <Loader /> : "Stats"}
        </Button>

        <Button onClick={onOpenTournament} className="bg-blue-600 text-white">
          Tournament
        </Button>
      </div>
    </div>
  );
};

const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
    </div>
  );
};
