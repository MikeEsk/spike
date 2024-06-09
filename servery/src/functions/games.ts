import { gamesPath, profiles } from "../constants";

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

export { createGame };
