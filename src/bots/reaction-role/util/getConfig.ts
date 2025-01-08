import { Message } from "discord.js";
import { load } from "js-yaml";
import { Config } from "../types";
import fs from "fs";
const configs = load(
  fs.readFileSync(__dirname + "/../config.yaml", "utf8"),
) as Config[];

const configMap = new Map();
configs.forEach((config) => {
  // no validation. we trust the dev.
  configMap.set(config.messageId, config);
});

function getConfig(message: Message): Config | undefined {
  if (!configMap.has(message.id)) {
    return;
  }

  return configMap.get(message.id);
}

export { getConfig };
