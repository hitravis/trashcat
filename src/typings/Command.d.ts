import { 
    ChatInputApplicationCommandData,
    CommandInteraction, 
    CommandInteractionOptionResolver, 
    GuildMember, 
    SlashCommandBuilder
} from "discord.js";
import { ExtendedClient } from "../structures/discord/Client";


export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

interface RunOptions {
    client: ExtendedClient,
    interaction: ExtendedInteraction,
    args: CommandInteractionOptionResolver
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
    data: SlashCommandBuilder;
    execute: RunFunction;
};
