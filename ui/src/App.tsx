import Home from "./Home";
import { useState } from "endr";
import ThunderDome from "./ThunderDome";

// tablet size 262 x 159 x 7.7 mm
// Screen Resolution	800 x 1280 pixels

export type Profile = {
  id: number;
  name: string;
  imageUrl: string;
};

export default () => {
  const [loadThunderdome, setLoadThunderdome] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);

  const profiles: Profile[] = [
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

  return (
    <div className="relative">
      <Home
        profiles={profiles}
        selectedProfiles={selectedProfiles}
        setSelectedProfiles={setSelectedProfiles}
        setLoadThunderdome={setLoadThunderdome}
      />
      {loadThunderdome && (
        <ThunderDome
          selectedProfiles={selectedProfiles}
          setLoadThunderdome={setLoadThunderdome}
          setSelectedProfiles={setSelectedProfiles}
        />
      )}
    </div>
  );
};
