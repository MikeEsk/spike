export const profiles: { id: number; name: string }[] = [
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

export const gamesPath = "games/log.txt";

export const sendSlackMessage = async ({
  subject,
  title,
  useTitle,
  message,
}: {
  subject: string;
  title: string;
  message?: string;
  useTitle?: boolean;
}) => {
  const slackMessage = {
    text: useTitle ? title : subject,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${title}\n${subject}${message ? `\n${message}` : ""}`,
        },
      },
    ],
  };

  const webhookUrl = process.env.SLACK_HOOK_URL;
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });
  } else {
    console.log("SLACK MESSAGE SENT: \n", slackMessage);
  }
};
