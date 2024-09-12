import type { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "Speakers",
    icon: "🎤",
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
    icon: "📅",
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
    icon: "🍔",
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
    icon: "🎮",
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
    icon: "💻",
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
