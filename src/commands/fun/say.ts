import { CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedInteraction } from "../../typings/Command";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("The Trashcat will repeat what you say.")
        .addStringOption(option =>
            option
                .setName("prompt")
                .setDescription("prompt")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    execute: async ({ interaction, args }:{interaction:ExtendedInteraction, args: CommandInteractionOptionResolver}) => {
        // Grab their prompt.
        const prompt: string | null = args.getString("prompt");
        if (prompt == null) {
            return interaction.followUp("Something went wrong. Sorry!");
        };
        
        // Repeat.
        interaction.followUp(prompt);
    }
});