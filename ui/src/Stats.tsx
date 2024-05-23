import { useState } from "endr";
import { Profile } from "./App";
import Button from "./Button";

const apiUrl = import.meta.env.VITE_API_URL;

const GridComponent = ({ data, onCloseStats }) => {
  const { playerStats, teamStats } = data;
  const playerNames = playerStats.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {});

  const playerColumns = [
    "name",
    "winPercentage",
    "pointsPerGame",
    "currentStreak",
  ];
  const teamColumns = [
    "team",
    "winPercentage",
    "pointsPerGame",
    "currentStreak",
  ];

  return (
    <div className="absolute bg-gray-300 top-0 left-0 right-0 bottom-0 grid grid-cols-2 grid-rows-2 gap-4 p-4">
      <div className="overflow-x-auto flex flex-col">
        <Table
          columns={playerColumns}
          data={playerStats}
          playerNames={playerNames}
        />
      </div>
      <div className="overflow-x-auto flex flex-col">
        <Table
          columns={teamColumns}
          data={teamStats}
          playerNames={playerNames}
        />
      </div>
      <div className="flex flex-col">Box 3</div>
      <div className="flex flex-col">Box 4</div>

      <Button
        onClick={onCloseStats}
        className="absolute top-2 left-2 bg-orange-500 text-white"
      >
        x
      </Button>
    </div>
  );
};

export default GridComponent;

const Table = ({ columns, data, playerNames }) => (
  <div>
    <div>
      <table className="overflow-x-auto min-w-full bg-white border border-gray-200">
        <thead
          style={{ position: "sticky", top: 0, backgroundColor: "#1C01CB" }}
        >
          <tr>
            {columns.map((column, index) => (
              <th
                key={column}
                className={`py-2 px-4 border-b border-gray-200 ${
                  index === 0 ? "text-left" : ""
                } text-sm font-semibold text-white`}
              >
                {column
                  .replace(/([A-Z])/g, " $1")
                  .trim()
                  .replace(/^./, (str) => str.toUpperCase())}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="m-0 p-0 text-sm text-gray-700 text-center"
                >
                  {column === "name" && typeof row[column] === "string" ? (
                    <div className="flex items-center  min-w-30">
                      <img
                        src={`${apiUrl}/pave/profilepics/${row[
                          column
                        ].toLowerCase()}`}
                        className="h-16 w-16 mr-4"
                      />
                      <span>{row[column]}</span>
                    </div>
                  ) : column === "team" && Array.isArray(row[column]) ? (
                    <div className="flex items-center space-x-2 min-w-30">
                      {row[column].map((id) => (
                        <div key={id} className="flex items-center">
                          <img
                            src={`${apiUrl}/pave/profilepics/${playerNames[
                              id
                            ].toLowerCase()}`}
                            className="h-16 w-16  object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    row[column]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
