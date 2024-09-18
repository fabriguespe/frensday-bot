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

  if (group && !content.includes("@" + name)) return;

  const language =
    "# Language\n Keep it simple and short. \nAlways answer in first person. \nNever mention users\nBe aware of your timezone and sleep needs.";
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
    if (reply.includes("[")) {
      let splitMessages = JSON.parse(reply);
      for (const message of splitMessages) {
        let msg = message as string;
        msg
          .replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // Remove links
          .replace(/^#+\s*(.*)$/gm, "$1") // Remove titles
          .replace(/`([^`]+)`/g, "$1"); // Remove inline code
        if (msg.startsWith("/")) await context.intent(msg);
        else await context.send(msg);
      }
    } else {
      const cleanedReply = reply
        .replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // Remove links
        .replace(/^#+\s*(.*)$/gm, "$1") // Remove titles
        .replace(/`([^`]+)`/g, "$1"); // Remove inline code
      if (cleanedReply.startsWith("/")) await context.intent(cleanedReply);
      else await context.send(cleanedReply);
    }
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.reply(
      "OOps looks like something went wrong. Please call my creator to fix me."
    );
  }
}
