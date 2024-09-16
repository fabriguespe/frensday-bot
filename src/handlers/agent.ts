import { HandlerContext, User } from "@xmtp/message-kit";
import { textGeneration } from "../lib/openai.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export async function handleAgent(context: HandlerContext) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content, params },
    },
  } = context;

  const systemPrompt = await generateSystemPrompt(context);
  try {
    let userPrompt = params?.prompt ?? content;
    if (process?.env?.MSG_LOG === "true") {
      console.log("userPrompt", userPrompt);
    }
    const { reply } = await textGeneration(userPrompt, systemPrompt);
    console.log("reply", reply);
    context.intent(reply);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.reply("An error occurred while processing your request.");
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSystemPrompt(context: HandlerContext) {
  const filePath = path.resolve(__dirname, "../../src/handlers/kuzco.md");
  const speakersFilePath = path.resolve(
    __dirname,
    "../../src/handlers/speakers.md"
  );
  const systemPrompt = fs.readFileSync(filePath, "utf8");
  const speakers = fs.readFileSync(speakersFilePath, "utf8");
  return systemPrompt + speakers;
}
