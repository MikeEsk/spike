import {
  calculateAllPlayerStats,
  calculateTeamStats,
  aggregateStats,
} from "./functions";

const profiles: { id: number; name: string }[] = [
  { id: 1, name: "Casey" },
  { id: 2, name: "Nate" },
  { id: 3, name: "Andrew" },
  { id: 4, name: "Bobby" },
  { id: 5, name: "Ross" },
  { id: 6, name: "Sam" },
  { id: 7, name: "Travis" },
  { id: 8, name: "Jared" },
  { id: 9, name: "Glick" },
  { id: 10, name: "Carter" },
  { id: 11, name: "Jeff" },
  { id: 12, name: "Zac" },
  { id: 13, name: "Nolan" },
  { id: 14, name: "Rilee" },
  { id: 15, name: "Mike" },
  { id: 16, name: "Michael" },
  { id: 17, name: "Hector" },
  { id: 18, name: "Madison" },
  { id: 19, name: "Chris" },
];

const gamesPath = "games/log.txt";

const createGame = async (request: Request) => {
  try {
    const res = await request.json();
    const scores = res?.data.createGame.$.scores;
    const stringData = JSON.stringify(scores) + "\n";

    const file = Bun.file(gamesPath);
    if (!file) {
      await Bun.write(gamesPath, stringData);
    } else {
      const text = await file.text();
      Bun.write(gamesPath, text + stringData);
    }

    const winnerTeam1 = profiles.find((p) => p.id === scores.winner.team[0]);
    const winnerTeam2 = profiles.find((p) => p.id === scores.winner.team[1]);
    const loserTeam1 = profiles.find((p) => p.id === scores.loser.team[0]);
    const loserTeam2 = profiles.find((p) => p.id === scores.loser.team[1]);
    const subject = `${winnerTeam1?.name} & ${winnerTeam2?.name} defeated ${loserTeam1?.name} & ${loserTeam2?.name}`;
    const scoreText = `*WE 🙂 WIN \`${scores.winner.score}-${scores.loser.score}\`*\n${subject}`;

    const slackMessage = {
      text: subject,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: scoreText,
          },
        },
      ],
    };

    const webhookUrl = process.env.SLACK_HOOK_URL;
    if (webhookUrl)
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackMessage),
      });

    return res.data.createGame.$.scores;
  } catch (error) {
    // Handle errors in parsing JSON or processing data
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Invalid JSON or Failed Processing" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

const PORT = 3048;
Bun.serve({
  port: PORT,
  fetch: async (request) => {
    // Handle OPTIONS method for CORS preflight
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*", // Allows all origins
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Ensure POST is explicitly allowed
      "Access-Control-Allow-Headers":
        "Access-Control-Allow-Origin, Content-Type", // Explicitly allow headers requested by the client
    });

    if (request.method === "OPTIONS") {
      return new Response(null, { headers, status: 201 }); // 204 No Content
    }

    const url = new URL(request.url);
    const baseUrl = "/pave";

    if (url.pathname.startsWith(`${baseUrl}/profilepics`)) {
      try {
        const path = `.${url.pathname}.jpeg`;

        return new Response(Bun.file(path), {
          headers: {
            "Content-Type": "application/octet-stream", // General binary type, consider specifying per file type
          },
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (url.pathname.startsWith(`${baseUrl}/playeraudio/`)) {
      try {
        const path = `.${url.pathname}.mp3`;

        // Serve the audio file
        return new Response(Bun.file(path), {
          headers: {
            "Content-Type": "audio/mpeg", // Correct MIME type for MP3 files
          },
        });
      } catch (err) {
        console.error(err);
        return new Response("File not found", {
          status: 404,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    if (url.pathname.startsWith(`${baseUrl}/profiles`)) {
      try {
        return new Response(JSON.stringify(profiles), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (url.pathname === `${baseUrl}/stats`) {
      try {
        const filePath = new URL("../games/log.txt", import.meta.url).pathname;
        const rawGames = await Bun.file(filePath).text();

        const games = rawGames
          .split("\n")
          .flatMap((game) => (game ? JSON.parse(game) : []));
        const playerStats = calculateAllPlayerStats(profiles, games);
        const teamStats = calculateTeamStats(games);
        const aggregate = aggregateStats(games);

        return new Response(
          JSON.stringify({
            playerStats,
            teamStats,
            aggregate,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } catch (err) {
        console.error(err);
      }
    }

    if (url.pathname.startsWith(`${baseUrl}`)) {
      try {
        const data = await createGame(request);
        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        console.error(err);
      }
    }

    // Handle 404 Not Found
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  },
});

console.log(`Bun server running on port${PORT}...`);
