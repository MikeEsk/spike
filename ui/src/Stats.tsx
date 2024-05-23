import { useState } from "endr";
import { Profile } from "./App";
import Button from "./Button";

const apiUrl = import.meta.env.VITE_API_URL;

const GridComponent = ({ data, onCloseStats }) => {
  const { playerStats, teamStats, aggregate } = data;
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
      <div className="flex-1 space-y-2">
        <div className="flex space-x-2">
          <BiggestWinBox
            data={aggregate.biggestWinMarginInSeries}
            playerNames={playerNames}
          />
          <HighestScoringGameBox
            data={aggregate.highestScoringGame}
            playerNames={playerNames}
          />
        </div>

        <div className="flex flex-1 space-x-2">
          <PlayerImprovementBox
            player={aggregate.mostImprovedPlayer}
            playerNames={playerNames}
            title="Most Improved Player"
          />
          <PlayerImprovementBox
            player={aggregate.mostWorsenedPlayer}
            playerNames={playerNames}
            title="Most Worstened Player"
          />
        </div>
      </div>

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
  <div className="bg-white shadow rounded">
    <table className="overflow-x-auto min-w-full">
      <thead style={{ position: "sticky", top: 0, backgroundColor: "#1C01CB" }}>
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
);

const BiggestWinBox = ({ data, playerNames }) => (
  <div className="p-4 border bg-white shadow rounded flex-grow">
    <h3 className="text-lg font-bold mb-2">Biggest Margin (3 games)</h3>
    <div className="flex justify-between items-center">
      <div>
        <div className="font-semibold">Winners: </div>
        <div>
          {data.series[0].winner.team.map((id) => playerNames[id]).join("/")}
        </div>
      </div>
      <div className="text-4xl font-bold p-1 bg-yellow-300  rounded-md">
        <span className="text-red-400">{data.biggestMargin}</span>
      </div>
      <div>
        <div className="font-semibold">Losers: </div>
        <div>
          {data.series[0].loser.team.map((id) => playerNames[id]).join("/")}
        </div>
      </div>
    </div>
  </div>
);

const HighestScoringGameBox = ({ data, playerNames }) => (
  <div className="p-4 border bg-white shadow rounded flex-grow">
    <h3 className="text-lg font-bold mb-2">Highest Scoring Game</h3>
    <div className="flex justify-between items-center">
      <div>
        <div className="font-semibold">Winner: </div>
        <div>{data.winner.team.map((id) => playerNames[id]).join("/")}</div>
      </div>
      <div className="text-4xl font-bold p-1 bg-yellow-300 text-red-400 rounded-md">
        {data.winner.score} - {data.loser.score}
      </div>
      <div>
        <div className="font-semibold">Loser: </div>
        <div>{data.loser.team.map((id) => playerNames[id]).join("/")}</div>
      </div>
    </div>
  </div>
);

const PlayerImprovementBox = ({ player, playerNames, title }) => (
  <div className="p-2 border bg-white shadow rounded flex flex-col flex-grow items-center">
    <h3 className="text-lg font-bold">{title}</h3>(last 5 games)
    <img
      src={`${apiUrl}/pave/profilepics/${playerNames[
        player.profile
      ].toLowerCase()}`}
      alt={playerNames[player.profile]}
      className="h-24 w-24 rounded-full object-cover mb-2"
    />
    <h3 className="text-xl font-bold mb-1">{playerNames[player.profile]}</h3>
    <p className="text-sm">
      {player.change > 0 ? "Improved" : "Worsened"} by {Math.abs(player.change)}
      %
    </p>
  </div>
);
