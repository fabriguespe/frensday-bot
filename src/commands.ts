import type { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Speakers",
    triggers: ["/speakers", "@earl", "@bittu", "@lili", "@peanut", "@kuzco"],
    description: "Get information about speakers.",
    commands: [
      {
        command: "/speakers",
        description: "Fetch and display the list of speakers.",
        params: {},
      },
    ],
  },
  {
    name: "Schedule",
    triggers: ["/schedule"],
    description: "Get the event schedule.",
    commands: [
      {
        command: "/schedule",
        description: "Fetch and display the event schedule.",
        params: {},
      },
    ],
  },
  {
    name: "Food",
    triggers: ["/food"],
    description: "Get details about food and beverages.",
    commands: [
      {
        command: "/food",
        description: "Fetch and display food and beverage details.",
        params: {},
      },
    ],
  },
  {
    name: "Games",
    triggers: ["/games"],
    description: "Get information about games and activities.",
    commands: [
      {
        command: "/games",
        description: "Fetch and display the list of games and activities.",
        params: {},
      },
    ],
  },
  {
    name: "Tech",
    triggers: ["/tech"],
    description: "Get information about technical topics.",
    commands: [
      {
        command: "/tech",
        description: "Fetch and display technical topics.",
        params: {},
      },
    ],
  },
];
