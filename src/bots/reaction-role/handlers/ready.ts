import { BaseGuildTextChannel, Client } from "discord.js";
import { load } from "js-yaml";
import fs from "fs";
import path from "path";
import { type Config } from "../types";

const configs = load(
  fs.readFileSync(__dirname + "/../config.yaml", "utf8"),
) as Config[];

module.exports = async (client: Client): Promise<void> => {
  console.log(__dirname.split(path.sep).slice(-2)[0]);

  for (const config of configs) {
    const channel = await client.channels.fetch(config.channelId);
    if (!channel || channel.type === "DM") {
      continue;
    }

    const message = await (channel as BaseGuildTextChannel).messages.fetch(
      config.messageId,
    );
    for (const emoji of Object.keys(config.emojiRoleMap)) {
      await message.react(emoji);
    }
  }

  console.log("reaction-role ready");
};
