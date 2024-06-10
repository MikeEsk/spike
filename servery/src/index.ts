import {
  createGame,
  calculateAllPlayerStats,
  calculateTeamStats,
  aggregateStats,
  createTournamentFromTeams,
  updateTournamentWithMatchResult,
} from "./functions";

import { profiles } from "./constants";

import fs from "fs";
import path from "path";

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

    if (url.pathname.startsWith(`${baseUrl}/createGame`)) {
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

    if (url.pathname.startsWith(`${baseUrl}/createTournament`)) {
      try {
        const requestBody = await request.json();
        const teams = requestBody.teams;
        const name = requestBody.name;

        if (!Array.isArray(teams) || teams.length < 3) {
          return new Response(
            JSON.stringify({ error: "Invalid teams array" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }

        const tournamentPathCheck = `./tournaments/${name.replace(
          /\s+/g,
          "_"
        )}.txt`;
        if (
          await fs.promises
            .access(tournamentPathCheck, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false)
        ) {
          throw new Error(`Tournament with the name "${name}" already exists.`);
        }

        const tournament = await createTournamentFromTeams({ teams, name });

        return new Response(tournament, {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error(error);
        return new Response(
          JSON.stringify({ error: "Failed to create tournament" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    if (url.pathname === `${baseUrl}/tournaments`) {
      try {
        const tournamentsDir = new URL("../tournaments/", import.meta.url)
          .pathname;
        const tournamentFiles = await fs.promises.readdir(tournamentsDir);
        const tournaments = await Promise.all(
          tournamentFiles.map(async (fileName) => {
            const filePath = path.join(tournamentsDir, fileName);
            const tournamentData = await Bun.file(filePath).text();
            return JSON.parse(tournamentData);
          })
        );
        return new Response(JSON.stringify(tournaments), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        console.error(err);
        return new Response("Internal Server Error", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    if (url.pathname.startsWith(`${baseUrl}/tournament`)) {
      try {
        const requestBody = await request.json();
        const name = requestBody.name;

        const tournamentPath = `./tournaments/${name.replace(/\s+/g, "_")}.txt`;

        if (
          await fs.promises
            .access(tournamentPath, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false)
        ) {
          const tournamentData = await Bun.file(tournamentPath).text();
          return new Response(tournamentData, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } else {
          return new Response(
            JSON.stringify({
              error: `Tournament with the name "${name}" not found.`,
            }),
            {
              status: 404,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
      } catch (error) {
        console.error(error);
        return new Response(
          JSON.stringify({ error: "Failed to retrieve tournament" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    if (url.pathname.startsWith(`${baseUrl}/updateTournament`)) {
      try {
        const requestBody = await request.json();
        const { tournamentName, scores } = requestBody.data;

        if (!tournamentName || !scores) {
          return new Response(
            JSON.stringify({ error: "Invalid request body" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        const tournamentPath = `./tournaments/${tournamentName.replace(
          /\s+/g,
          "_"
        )}.txt`;
        const tournamentData = await Bun.file(tournamentPath).text();
        const tournament = JSON.parse(tournamentData);

        const updatedTournament = updateTournamentWithMatchResult(
          tournament,
          scores
        );
        const updatedTournamentString = JSON.stringify(
          updatedTournament,
          null,
          2
        );
        await Bun.write(tournamentPath, updatedTournamentString);

        return new Response(updatedTournamentString, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: `${error}` }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
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
