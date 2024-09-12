import cron from "node-cron";
import { Client } from "@xmtp/xmtp-js";
import { RedisClientType } from "@redis/client";
import { fetchSpeakers } from "./eventapi.js";

export async function startCron(
  redisClient: RedisClientType,
  v2client: Client
) {
  console.log("Starting cron job to send upcoming speaker events");
  const conversations = await v2client.conversations.list();
  cron.schedule(
    "*/10 * * * * *", // Every 10 seconds
    async () => {
      const keys = await redisClient.keys("*");
      console.log(`Running task. ${keys.length} subscribers.`);
      const speakers = await fetchSpeakers();
      const speakerInfo = speakers
        .map(
          (speaker: any) =>
            `Name: ${speaker.name}\nBiography: ${speaker.biography}\nAvatar: ${speaker.avatar}\n---\n`
        )
        .join("");
      for (const address of keys) {
        const subscriptionStatus = await redisClient.get(address);
        if (subscriptionStatus === "subscribed") {
          console.log(`Sending speaker updates to ${address}`);
          const targetConversation = conversations.find(
            (conv) => conv.peerAddress === address
          );
          if (targetConversation) {
            await targetConversation.send(
              "Check out the latest speaker updates:\n\n" + speakerInfo
            );
          }
        }
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
}
