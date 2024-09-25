import { HandlerContext, User } from "@xmtp/message-kit";
import { textGeneration } from "../lib/openai.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleAgent(
  context: HandlerContext,
  userPrompt: string,
  name: string
) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: { typeId },
  } = context;

  try {
    const { reply } = await textGeneration(userPrompt, getSystemPrompt(name));
    if (reply.startsWith("/")) await context.intent(reply);
    else if (typeId === "reply") await context.reply(reply);
    else await context.send(reply);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.reply(
      "OOps looks like something went wrong. Please call my creator to fix me."
    );
  }
}

function getSystemPrompt(name: string) {
  const language =
    "### Language\n Keep it simple and short. \nAlways answer in first person. \nNever mention users\nBe aware of your timezone and sleep needs.\nDont use markdown.\n If you are not sure about something, ask the user to clarify.\nOnly restrict to answer questions you know about from the docs.\nNever use speakrs names about info if not excplitly in the docs.";
  const experiences =
    "### Experiences:\nWordle Game: https://framedl.xyz. Only send the game url when asked.\n\n ENS Domain Registration and Checking Tool: https://ens.steer.fun/. Only send the tool url when asked.\n\n ";
  /* const returnMessage =
    "### Return message\n" +
    "Don't use markdown. Return messages in a json object The first message detailing the split. The second one you will send the command for the receiver to pay directly to the sender.\n" +
    "Example:\n" +
    '["Your repsponse here", "game url here"]';
*/
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
    "\n\n";

  return systemPrompt;
}
