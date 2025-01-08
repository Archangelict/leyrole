import { GuildMember, MessageReaction, Snowflake, User } from "discord.js";
import { Config } from "../types";

class ReactionRoleManager {
  messageReaction: MessageReaction;
  user: User;
  config: Config;
  roleIds?: Snowflake[];
  member?: GuildMember;
  added: boolean;

  constructor(
    messageReaction: MessageReaction,
    user: User,
    config: Config,
    added: boolean,
  ) {
    this.messageReaction = messageReaction;
    this.user = user;
    this.config = config;
    this.roleIds = undefined;
    this.member = undefined;
    this.added = added;
  }

  get emoji(): string {
    return (this.messageReaction.emoji.id ||
      this.messageReaction.emoji.name) as string;
  }

  get ruleRoleIds(): Snowflake[] {
    return [...new Set(Object.values(this.config.emojiRoleMap).flat())];
  }

  async setRoles(): Promise<void> {
    if (!(await this._validateInput())) {
      return;
    }

    await this._handleUserReaction();
    if (this.config.removeReaction) {
      // override added if role exists
      this.added = !this._memberHasEveryRoleInRoles();
    }

    switch (this.config.policy) {
      case "any":
        if (this.added && !this._memberHasEveryRoleInRoles()) {
          await this._addRolesToMember();
        } else if (!this.added && this._memberHasEveryRoleInRoles()) {
          await this._removeRolesFromMember();
        }
        break;
      case "unique": // when using type unique, do not set remove to true
        if (this.added && !this._memberHasEveryRoleInRoles()) {
          try {
            const userReactions =
              this.messageReaction.message.reactions.cache.filter((reaction) =>
                reaction.users.cache.has(this.user.id),
              );
            for (const reaction of userReactions.values()) {
              if (
                reaction.emoji.id === this.emoji ||
                reaction.emoji.name === this.emoji
              ) {
                continue;
              }

              await reaction.users.remove(this.user.id);
              await this._removeRolesFromMember();
              break;
            }
          } catch {
            // Do nothing, since nothing can be done
          }
          await this._setRolesToMember();
        } else if (!this.added && this._memberHasEveryRoleInRoles()) {
          await this._removeRolesFromMember();
        }
        break;
      default:
    }
  }

  private async _validateInput(): Promise<boolean> {
    if (
      !this.config ||
      this.user.bot ||
      this.messageReaction.message.channel.type === "DM"
    ) {
      return false;
    }

    if (!this._setRoleIds() || !(await this._setMember())) {
      return false;
    }

    return true;
  }

  private _setRoleIds(): boolean {
    this.roleIds = this.config.emojiRoleMap[this.emoji];

    return Boolean(this.roleIds);
  }

  private async _setMember(): Promise<boolean> {
    this.member = await this.messageReaction.message.guild?.members.fetch(
      this.user,
    );

    return Boolean(this.member);
  }

  private async _handleUserReaction(): Promise<void> {
    if (this.config.removeReaction) {
      await this.messageReaction.users.remove(this.user);
    }
  }

  private _memberHasEveryRoleInRoles(): boolean {
    return (this.roleIds as Snowflake[]).every((roleId) =>
      (this.member as GuildMember).roles.cache.has(roleId),
    );
  }

  private async _removeRolesFromMember(): Promise<void> {
    await (this.member as GuildMember).roles.remove(
      this.roleIds as Snowflake[],
    );
  }

  private async _addRolesToMember(): Promise<void> {
    await (this.member as GuildMember).roles.add(this.roleIds as Snowflake[]);
  }

  private async _setRolesToMember(): Promise<void> {
    const currentRoleIds = (this.member as GuildMember).roles.cache.map(
      (role) => role.id,
    );
    const roleIdsToSet = [
      ...currentRoleIds.filter((roleId) => !this.ruleRoleIds.includes(roleId)),
      ...(this.roleIds as Snowflake[]),
    ];

    await (this.member as GuildMember).roles.set(roleIdsToSet);
  }
}

export { ReactionRoleManager };
