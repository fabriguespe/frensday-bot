import { HandlerContext, User } from "@xmtp/message-kit";
import { textGeneration } from "../lib/openai.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleAgent(context: HandlerContext, name: string) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content, params },
      sender,
    },
    group,
  } = context;

  const ens = [
    "0x840c601502C56087dA44A8176791d33f4b741aeC",
    "0xE1f36769cfBf168d18d37D5257825E1E272ba843",
    "0xf6A5657d0409eE8188332f0d3E9348242b54c4dc",
    "0x840c601502C56087dA44A8176791d33f4b741aeC",
    "0xbef3B8277D99A7b8161C47CD82e85356D26E4429",
    "0xc143D1b3a0Fe554dF36FbA0681f9086cf2640560",
  ];
  if (
    ens.includes(sender.address) ||
    (group && !content.includes("@" + name))
  ) {
    return;
  }
  const language =
    "# Language\n Keep it simple and short. \nAlways answer in first person. \nNever mention users\n If sending an experience you must include a link in the message.\nBe aware of your timezone and sleep needs.";
  const experiences =
    "# Experiences:\nWordle Game: https://framedl.xyz\n\n ENS Domain Tool: https://ens.steer.fun/\n\n ";
  const returnMessage =
    "### Return message\n" +
    "Don't use markdown. Return messages in a json object The first message detailing the split. The second one you will send the command for the receiver to pay directly to the sender.\n" +
    "Example:\n" +
    '["Your repsponse here", "game url here"]';

  const bangkokTimezone = "Asia/Bangkok";
  const currentTime = new Date().toLocaleString("en-US", {
    timeZone: bangkokTimezone,
  });
  const timeInfo = `# Current Time\nCurrent time in Bangkok: ${currentTime}\n\n`;

  const filePath = path.resolve(__dirname, `../../src/characters/${name}.md`);
  const speakersFilePath = path.resolve(
    __dirname,
    "../../src/data/speakers.md"
  );
  const character = fs.readFileSync(filePath, "utf8");
  const speakers = fs.readFileSync(speakersFilePath, "utf8");

  const systemPrompt =
    character +
    "\n\n" +
    speakers +
    "\n\n" +
    experiences +
    "\n\n" +
    language +
    "\n\n" +
    timeInfo +
    "\n\n" +
    returnMessage;

  try {
    let userPrompt = params?.prompt ?? content;
    if (process?.env?.MSG_LOG === "true") {
      console.log("userPrompt", userPrompt);
    }
    const { reply } = await textGeneration(userPrompt, systemPrompt);
    // Clean markdown formatting
    let splitMessages = JSON.parse(reply);
    for (const message of splitMessages) {
      let msg = message as string;
      if (msg.startsWith("/")) await context.intent(msg);
      else await context.send(msg);
    }

    const cleanedReply = reply
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // Remove links
      .replace(/^#+\s*(.*)$/gm, "$1") // Remove titles
      .replace(/`([^`]+)`/g, "$1"); // Remove inline code
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.reply("An error occurred while processing your request.");
  }
}
