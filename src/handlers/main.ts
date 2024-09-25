import { HandlerContext, Config } from "@xmtp/message-kit";
import { fetchSpeakers } from "../lib/eventapi.js";
import { handleAgent } from "./agent.js";
import { run } from "@xmtp/message-kit";
import { startCron } from "../lib/cron.js";
import { getRedisClient } from "../lib/redis.js";
import { xmtpClient } from "@xmtp/message-kit";
import { RedisClientType } from "@redis/client";

const inMemoryCacheStep = new Map<string, number>();
const stopWords = ["cancel", "reset"];

const redisClient: RedisClientType = await getRedisClient();

const { v2client } = await xmtpClient({}, process.env.KEY_EARL);
startCron(redisClient, v2client);

export async function mainHandler(appConfig: Config, name: string) {
  run(async (context: HandlerContext) => {
    const {
      message: {
        content: { content: text, params },
        content,
        typeId,
        sender,
      },
      group,
      version,
      getReplyChain,
    } = context;
    const isBotBool = await isBot(sender.address);
    if (isBotBool) return; //return if its bot

    if (typeId !== "text" && typeId !== "reply") return;
    const lowerContent = text?.toLowerCase();

    if (stopWords.some((word) => lowerContent.includes(word))) {
      inMemoryCacheStep.set(sender.address, 0);
      return;
    }
    if (lowerContent.startsWith("/")) {
      context.intent(text);
      return;
    } else if (
      !group ||
      (group && typeId === "text" && text.includes("@" + name))
    ) {
      let userPrompt = text;
      await handleAgent(context, userPrompt, name);
      return;
    } else if (typeId === "reply") {
      const { content: reply, reference } = content;
      const botAddress = getBotAddress(name);
      const { chain } = await getReplyChain(reference, version, botAddress);

      let userPrompt = `The following is a conversation history. \nMessage History:\n${chain
        .map((c) => c.content)
        .join("\n")}\nLatest reply: ${reply}`;

      if (await isReplyFromBot(chain, userPrompt, name)) {
        await handleAgent(context, userPrompt, name);
      }
      return;
    } else if (group) return;

    const cacheStep = inMemoryCacheStep.get(sender.address) || 0;
    let message = "";

    if (cacheStep === 0) {
      await handleIntro(context);
      inMemoryCacheStep.set(sender.address, cacheStep + 1);
    } else if (cacheStep === 1) {
      switch (text) {
        case "1":
          await handleSpeakers(context);
          break;
        case "2":
          await handleSchedule(context);
          break;
        case "3":
          await handleFood(context);
          break;
        case "4":
          await handleGames(context);
          break;
        case "5":
          await handleTech(context);
          break;
        case "6":
          await redisClient.set(sender.address, "subscribed");
          message =
            "You are now subscribed. You will receive updates.\ntype 'stop' to unsubscribe";
          inMemoryCacheStep.set(sender.address, 0);
          break;
        case "7":
        case "unsubscribe":
        case "stop":
          await redisClient.del(sender.address);
          message =
            "You are now unsubscribed. You will no longer receive updates!";
          inMemoryCacheStep.set(sender.address, 0);
          break;
        default:
          message = "Invalid option. Please choose a number from 1 to 7.";
      }
    } else {
      message = "Invalid option. Please start again.";
      inMemoryCacheStep.set(sender.address, 0);
    }

    if (message) {
      await context.send(message);
    }
  }, appConfig);
}

const getBotAddress = (name: string) => {
  const isDeployed = process.env.NODE_ENV === "production";
  //console.log("isDeployed", isDeployed);
  const addressList = isDeployed ? botAddresses : botLocalAddresses;
  if (addressList) {
    return addressList.find(
      (bot) => bot.name.toLowerCase() === name.toLowerCase()
    )?.address;
  }
};

async function isReplyFromBot(chain: any, userPrompt: string, name: string) {
  if (userPrompt.includes("@" + name)) return true;
  const botAddress = getBotAddress(name);
  if (!botAddress) return false;

  return chain.some(
    (c: any) => c.address.toLowerCase() == botAddress.toLowerCase()
  );
}
const botAddresses = [
  { name: "earl", address: "0x840c601502C56087dA44A8176791d33f4b741aeC" },
  { name: "lili", address: "0xE1f36769cfBf168d18d37D5257825E1E272ba843" },
  { name: "peanut", address: "0xf6A5657d0409eE8188332f0d3E9348242b54c4dc" },
  { name: "kuzco", address: "0xbef3B8277D99A7b8161C47CD82e85356D26E4429" },
  { name: "bittu", address: "0xc143D1b3a0Fe554dF36FbA0681f9086cf2640560" },
];
const botLocalAddresses = [
  { name: "bittu", address: "0xa1C6718567B4960380235a07c1B0793aF81B1264" },
  { name: "lili", address: "0xFD18Eff445A32010bFB2Ab32A0F7A02CF08bAfdB" },
  { name: "earl", address: "0xe9791cb9Db1eF92Ed0670B31ab9a9453AA7BFb4c" },
  { name: "peanut", address: "0x839e618F3b928195b9572e3939bEF13ddF446717" },
  { name: "kuzco", address: "0x3C348aEF831a28f80FF261B028a0A9b2491C0BA6" },
];

async function getBotName(address: string) {
  return botLocalAddresses
    .map((bot) => bot.address.toLowerCase())
    .includes(address.toLowerCase())
    ? botLocalAddresses.find(
        (bot) => bot.address.toLowerCase() === address.toLowerCase()
      )?.name
    : botAddresses.find(
        (bot) => bot.address.toLowerCase() === address.toLowerCase()
      )?.name;
}
async function isBot(address: string) {
  return (
    botAddresses
      .map((bot) => bot.address.toLowerCase())
      .includes(address.toLowerCase()) ||
    botLocalAddresses
      .map((bot) => bot.address.toLowerCase())
      .includes(address.toLowerCase())
  );
}
export async function handleIntro(context: HandlerContext) {
  const introMessage = `Welcome to the ENS Conference! I'm Earl, your Leader Energy.\n
  Here are the things you can learn about:\n
  1. Speakers: Learn about the speakers
  2. Schedule: Check today's schedule
  3. Food: Get details about food and beverages
  4. Games: Find out about fun activities
  5. Tech: Discover technical topics
  6. Subscribe: Subscribe to updates
  7. Unsubscribe: Unsubscribe from updates
  `;
  await context.send(introMessage);
}

export async function handleSpeakers(context: HandlerContext) {
  const introMessage =
    "Hi, I'm Li Li, your Technical Topics Liaison. Here are the speakers for today:\n";
  const speakers = await fetchSpeakers();
  await context.send(introMessage + speakers);
}

export async function handleSchedule(context: HandlerContext) {
  const scheduleMessage = `Hi, I'm Kuzco, your Schedule Sherpa. Here is today's schedule:\n
  - 10:00 AM: Opening Ceremony
  - 11:00 AM: Keynote Speaker
  - 12:00 PM: Lunch Break
  - 2:00 PM: Panel Discussion
  - 4:00 PM: Workshops
  - 6:00 PM: Closing Remarks
  `;
  await context.send(scheduleMessage);
}

export async function handleFood(context: HandlerContext) {
  const foodMessage = `Hey there, I'm Peanut, the Gourmand. Here are the food and beverage details:\n
  - Lunch at 12 PM: Sandwiches, Salads, Desserts
  - Coffee Hour at 3 PM
  - Happy Hour Drinks at 5 PM
  `;
  await context.send(foodMessage);
}

export async function handleGames(context: HandlerContext) {
  const gamesMessage = `Hi, I'm Bittu, the Games Master. Here are the fun activities for today:\n
  - Mini POAP Quests throughout the day
  - Swag available at the registration desk
  - Join the fun activities announced here
  `;
  await context.send(gamesMessage);
}

export async function handleTech(context: HandlerContext) {
  const techMessage = `Hello, I'm Li Li, your Technical Topics Liaison. Here are the technical topics for today:\n
  - Learn about the topics being discussed
  - Meet the panelists and speakers
  - Discover more about ENS as a protocol
  `;
  await context.send(techMessage);
}
