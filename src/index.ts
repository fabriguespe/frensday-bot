import { run, HandlerContext } from "@xmtp/message-kit";
import { CurrentStep } from "./lib/types.js";
import {
  BET_AMOUNT_ERROR_REPLY,
  BET_AMOUNT_REPLY,
  BET_MESSAGE_REPLY,
  BET_OPTIONS_ERROR_REPLY,
  BET_OPTIONS_REPLY,
  BET_CREATE_REPLY,
  BET_LIST_REPLY,
  NO_PENDING_BETS_ERROR,
  BET_RECAP_REPLY,
} from "./lib/constants.js";
import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "./lib/redis.js";
import { commands } from "./commands.js";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { BETBOT_ABI } from "./abi/index.js";
import { handleCointossCommand } from "./handlers/agent.js";
import { handleBetCreation } from "./handlers/bet.js";
// track conversation steps
const inMemoryCacheStep = new Map<string, CurrentStep>();

const isStopMessage = (message: string) => {
  const stopMessages = ["stop", "cancel", "exit", "quit", "restart", "reset"];
  return stopMessages.includes(message.toLowerCase());
};

const handleStopMessage = async (context: HandlerContext, sender: string) => {
  inMemoryCacheStep.delete(sender);
  await context.send(BET_MESSAGE_REPLY);
};

const commandHandlers = {
  "/bet": handleBetCreation,
};

async function fetchSpeakers() {
  const response = await fetch(
    "https://talks.ens.day/api/events/frensday-2024/speakers/"
  );
  const data = await response.json();
  return (data as any).results;
}

run(
  async (context: HandlerContext) => {
    const {
      message: {
        content: { content: text, params },
        typeId,
        sender,
      },
      group,
    } = context;
    if (typeId !== "text") return;

    if (isStopMessage(text)) {
      await handleStopMessage(context, sender.address);
      return;
    }
    const speakers = await fetchSpeakers();
    let speakerInfo = "";
    speakers.forEach((speaker: any) => {
      speakerInfo += `Name: ${speaker.name}\n`;
      speakerInfo += `Biography: ${speaker.biography}\n`;
      speakerInfo += `Avatar: ${speaker.avatar}\n`;
      speakerInfo += "---\n";
    });
    await context.send(speakerInfo);
  },
  {
    commandHandlers: commandHandlers,
    commands: commands,
  }
);
