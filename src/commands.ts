import type { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Bet",
    icon: "💸",
    description: "Betting commands.",
    commands: [
      {
        command: "/bet [description] [options] [amount]",
        description: "Create a bet with a description, options and amount.",
        params: {
          description: {
            type: "quoted",
          },
          options: {
            default: "Yes, No",
            type: "quoted",
          },
          amount: {
            type: "number",
          },
        },
      },
    ],
  },
];
