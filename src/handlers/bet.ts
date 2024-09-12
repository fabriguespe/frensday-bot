import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "../lib/redis.js";
import { HandlerContext } from "@xmtp/message-kit";

export async function handleBetCreation(context: HandlerContext) {
  const {
    message: {
      content: { content, params },
      sender,
    },
  } = context;
  if (params.description && params.options && params.amount) {
    const uuid = await createBet(
      context,
      sender.address,
      params.options,
      params.amount,
      params.description
    );
    await context.send(`${process.env.FRAME_URL}/frames/new-bet?id=${uuid}`);
  }
}

export const createBet = async (
  context: HandlerContext,
  sender: string,
  options: string,
  amount: string,
  description: string
) => {
  await context.send(
    `You are creating a bet of ${amount} USDC on "${description}", either "${options
      .split(",")[0]
      .trim()}" or "${options.split(",")[1].trim()}".`
  );

  const uuid = uuidv4();
  const redis = getRedisClient();
  await redis.set(
    uuid,
    JSON.stringify({
      description: description,
      options: options,
      amount: amount,
      admin: sender,
    })
  );

  return uuid;
};
