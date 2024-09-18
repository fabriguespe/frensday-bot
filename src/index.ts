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
  name: "kuzco",
};
const appConfig_PEANUT = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_PEANUT,
  name: "peanut",
};
const appConfig_LILI = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_LILI,
  name: "lili",
};
const appConfig_EARL = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_EARL,
  name: "earl",
};
const appConfig_BITTU = {
  commands: commands,
  commandHandlers: commandHandlers,
  privateKey: process.env.KEY_BITTU,
  name: "bittu",
};

Promise.all([
  mainHandler(appConfig_KUZCO, appConfig_KUZCO.name),
  mainHandler(appConfig_PEANUT, appConfig_PEANUT.name),
  mainHandler(appConfig_LILI, appConfig_LILI.name),
  mainHandler(appConfig_EARL, appConfig_EARL.name),
  mainHandler(appConfig_BITTU, appConfig_BITTU.name),
]);
