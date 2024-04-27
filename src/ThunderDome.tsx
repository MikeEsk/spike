import { Profile } from "./App";

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

export default ({ selectedProfiles }: { selectedProfiles: Profile[] }) => {
  return (
    <div className="absolute top-0 w-screen h-screen flex items-center justify-center bg-transparent z-100">
      <div className="w-1/2 h-full flex flex-col items-center justify-center bg-blue-500 transform -translate-x-full animate-slideInLeft">
        <h1 className="text-white text-4xl font-bold mb-4">Team 1</h1>
        <Warrior profile={selectedProfiles[0]} />
        <Warrior profile={selectedProfiles[1]} />
      </div>

      <div className="w-1/2 h-full flex flex-col items-center justify-center bg-red-500 transform translate-x-full animate-slideInRight">
        <h1 className="text-white text-4xl font-bold mb-4">Team 2</h1>
        <Warrior profile={selectedProfiles[2]} />
        <Warrior profile={selectedProfiles[3]} />
      </div>
    </div>
  );
};
