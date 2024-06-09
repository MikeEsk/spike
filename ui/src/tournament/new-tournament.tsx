import { useEffect, useRef } from "endr";
import Button from "../button";

export default ({
  onCreate,
  tournamentName,
  setTournamentName,
  tournamentType,
  setTournamentType,
}) => {
  const tournamentNameInputRef = useRef(null);

  // The inputs onChange isn't firing
  useEffect(() => {
    const handleNameChange = (event) => setTournamentName(event.target.value);
    const inputElement = tournamentNameInputRef.current;
    if (inputElement) {
      inputElement.addEventListener("input", handleNameChange);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("input", handleNameChange);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 text-purple-900 font-bold">
            Create New Tournament
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2">
                <label
                  htmlFor="tournament-name"
                  className="flex text-sm font-lg font-bold text-gray-700"
                >
                  Tournament Name
                </label>
                <input
                  ref={tournamentNameInputRef}
                  type="text"
                  name="tournament-name"
                  id="tournament-name"
                  autoComplete="off"
                  value={tournamentName}
                  placeholder="Enter tournament name"
                  className="mt-3 p-3 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg "
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="tournament-type"
                className="flex text-sm font-lg font-bold text-gray-700"
              >
                Tournament Type
              </label>
              <select
                id="tournament-type"
                name="tournament-type"
                value={tournamentType}
                onChange={(e) => setTournamentType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="single">Single Elimination</option>
                <option value="double">Double Elimination</option>
              </select>
            </div>
            <div className="mt-8">
              <Button
                onClick={onCreate}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Pick Teams
                <strong className="ml-2">→</strong>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
