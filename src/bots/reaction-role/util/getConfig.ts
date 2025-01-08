import { Message } from "discord.js";
import jsYaml from "js-yaml";
import { Config } from "../types";

const configs = jsYaml.load("../config.yaml") as Config[];

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
