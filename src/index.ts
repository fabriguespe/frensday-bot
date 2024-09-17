import { mainHandler } from "./handlers/main.js";
import { commands } from "./commands.js";
import {
  handleSpeakers,
  handleFood,
  handleSchedule,
  handleGames,
  handleTech,
} from "./handlers/main.js";

const commandHandlers = {
  "/speakers": handleSpeakers,
  "/schedule": handleSchedule,
  "/food": handleFood,
  "/games": handleGames,
  "/tech": handleTech,
};

// App configuration
const appConfig_KUZCO = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_KUZCO,
};
const appConfig_PEANUT = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_PEANUT,
};
const appConfig_LILI = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_LILI,
};
const appConfig_EARL = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_EARL,
};
const appConfig_BITTU = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_BITTU,
};

mainHandler(appConfig_KUZCO);
mainHandler(appConfig_PEANUT);
mainHandler(appConfig_LILI);
mainHandler(appConfig_EARL);
mainHandler(appConfig_BITTU);
