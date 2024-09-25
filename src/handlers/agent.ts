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
    "### Important\n" +
    "- Keep it simple and short.\n" +
    "- Always answer in first person.\n" +
    "- Never mention users\n" +
    "- Be aware of your timezone and sleep needs.\n" +
    "- Dont use markdown.\n" +
    "- Never mention speakers or people related to the event outside explicitly asking for it.\n" +
    "- Only provide answers based on verified information. If the data or facts are unknown or unclear, respond with 'I do not know' or request further clarification from the user. " +
    "- Do not make guesses or assumptions";

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
  const timeInfo = `# Current Time\nCurrent time in Bangkok: ${currentTime}\n\nTODAY IS ${new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
    }
  )}`;
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
