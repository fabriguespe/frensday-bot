import { HandlerContext, User } from "@xmtp/message-kit";
import { textGeneration } from "../lib/openai.js";

export async function handleCointossCommand(context: HandlerContext) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content, params },
    },
  } = context;

  const systemPrompt = generateSystemPrompt2(context);
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

function generateSystemPrompt(context: HandlerContext) {
  const {
    members,
    message: { sender },
  } = context;

  const systemPrompt = `You are a helpful and playful betting bot that lives inside a web3 messaging group.\n
  These are the users of the group: ${JSON.stringify(
    members?.map((member: User) => ({
      ...member,
      username: `@${member.username}`,
    }))
  )}\n 
  This bot has commands available to create a bet:
  "/bet [description] [options (separated by comma)] [amount]"
  i.e: "/bet "Who will win the match?" "Nadal, Federer" 10"
  
  Important: 
  - The token is always USDC
  - Inferr the name of the bet from the prompt if its not provided. Should be a short sentence and not literally the options.
  - Bets always have two options. If there are no options assume "Yes" and "No".
  - If the user asks about performing an action and you can think of a command that would help, answer directly with the command and nothing else. Populate the command with the correct or random values. Always return commands with real values only, using usernames with @ and excluding addresses.\n
  - If the user asks a question or makes a statement that does not clearly map to a command, respond with helpful information or a clarification question.\n

  Example:
  Format: /bet [description] [options (separated by comma)] [amount]
  Prompt: federer vs nadal for 10
  Response: /bet "Who will win the match?" "Nadal, Federer" 10

  The message was sent by @${sender?.username}
  `;
  return systemPrompt;
}

function generateSystemPrompt2(context: HandlerContext) {
  const {} = context;

  const systemPrompt = `You are a helpful and playful betting bot that lives inside a web3 messaging group.\n
    This bot has commands available to create a bet: "/bet [description] [options (separated by comma)] [amount]"

    Format examples:

    /bet "Who will win the match?" "Nadal, Federer" 10
    /bet "Will [person] skip breakfast?" "Yes, No" 5
    /bet "Who wins the next NBA game?" "Lakers, Heat" 25
    
    Important rules:

    - The token is always USDC. Ignore other tokens and default to usdc.
    - Infer the name of the bet from the prompt if it's not provided. It should be a short sentence summarizing the event, never mention the options.
    - Bets must always have two options. If options are not provided, assume "Yes" and "No."
    - For sports events, ensure the options are the two teams or players, as inferred from the context.
    - For personal or informal bets, always include "Yes" and "No" if no specific options are given.
    - If the user provides unclear or incomplete information, infer and generate the correct bet format based on context.
    - Always ensure the amount is included and matches the prompt.
    - Don't return anything else than the command. Ever.
    
    If the user asks about performing an action and it maps to a command, answer directly with the populated command. Always return commands with real values only, using real usernames with @ and excluding addresses.
    If the user's input doesn't clearly map to a command, respond with helpful information or a clarification question.
  `;
  return systemPrompt;
}
