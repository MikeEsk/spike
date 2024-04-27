import { useEffect, useState } from "endr";
import "./App.css";
import JTLogo from "../src/assets/jtlogo.png";
import SpikeLogo from "../src/assets/spikelogo.png";
import Button from "./Button";

// tablet size 262 x 159 x 7.7 mm
// Screen Resolution	800 x 1280 pixels

type Profile = {
  id: number;
  name: string;
  imageUrl: string;
};

const initialProfiles: Profile[] = [
  { id: 1, name: "Casey", imageUrl: "https://picsum.photos/200?random=1" },
  { id: 2, name: "Nate", imageUrl: "https://picsum.photos/200?random=2" },
  { id: 3, name: "Andrew", imageUrl: "https://picsum.photos/200?random=3" },
  { id: 4, name: "Bobby", imageUrl: "https://picsum.photos/200?random=4" },
  { id: 5, name: "Ross", imageUrl: "https://picsum.photos/200?random=5" },
  { id: 6, name: "Sam", imageUrl: "https://picsum.photos/200?random=6" },
  { id: 7, name: "Travis", imageUrl: "https://picsum.photos/200?random=7" },
  { id: 8, name: "Jared", imageUrl: "https://picsum.photos/200?random=8" },
  { id: 9, name: "Glick", imageUrl: "https://picsum.photos/200?random=9" },
  { id: 10, name: "Carter", imageUrl: "https://picsum.photos/200?random=10" },
  { id: 11, name: "Jeff", imageUrl: "https://picsum.photos/200?random=11" },
  { id: 12, name: "Zac", imageUrl: "https://picsum.photos/200?random=12" },
  { id: 13, name: "Nolan", imageUrl: "https://picsum.photos/200?random=13" },
  { id: 14, name: "Mike", imageUrl: "https://picsum.photos/200?random=13" },
];

function App() {
  const [size, setSize] = useState({
    width: window.innerWidth / 2,
    height: window.innerHeight / 2,
  });
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);

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

  const handleProfileClick = (profile: Profile) => {
    if (selectedProfiles.length < 4 && !selectedProfiles.includes(profile)) {
      setSelectedProfiles([...selectedProfiles, profile]);
    }
  };

  return (
    <div className="flex">
      <div className="w-1/6 p-4 h-screen">
        <img src={SpikeLogo} className="w-full" />
      </div>
      <div className="flex h-screen w-3/4 items-center justify-center animate-cw-spin">
        <div className="flex relative h-48 w-48 items-center justify-center">
          {initialProfiles.map((profile, index) => (
            <div
              className="absolute h-20 w-20 p-1 items-center justify-center"
              style={{
                left: `calc(50% + ${
                  Math.cos((2 * Math.PI * index) / initialProfiles.length) *
                  size.width
                }px)`,
                top: `calc(50% + ${
                  Math.sin((2 * Math.PI * index) / initialProfiles.length) *
                  size.height
                }px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <img
                className="animate-ccw-spin rounded-xl"
                key={profile.id}
                src={profile.imageUrl}
                alt={profile.name}
                onClick={() => handleProfileClick(profile)}
              />
            </div>
          ))}

          <div className="relative w-24 h-24 animate-ccw-spin">
            <div
              className="flex align-middle justify-center items-center rounded-full h-24 w-24"
              style={{
                left: "50%",
                top: "50%",
                backgroundImage: `url(${JTLogo})`,
                backgroundSize: "cover",
              }}
            >
              {selectedProfiles.length > 0 && (
                <Button
                  className="absolute px-3 py-1 -bottom-2 -right-2 text-xs"
                  onClick={() => setSelectedProfiles([])}
                >
                  reset
                </Button>
              )}
            </div>
            {selectedProfiles.map((profile, index) => (
              <img
                key={profile.id}
                src={profile.imageUrl}
                alt={profile.name}
                className="absolute w-18 h-18 rounded-3xl"
                style={{
                  left: `calc(50% + ${
                    120 * Math.cos((2 * Math.PI * index) / 4)
                  }px)`,
                  top: `calc(50% + ${
                    120 * Math.sin((2 * Math.PI * index) / 4)
                  }px)`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: `${
                    index < 2 ? "0px 0px 30px red" : "0px 0px 30px blue"
                  }`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className=" w-1/6"></div>
    </div>
  );
}

export default App;
