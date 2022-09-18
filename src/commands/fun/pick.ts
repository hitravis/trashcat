import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("pick")
        .setDescription("The Trashcat will decide for you.")
        .addStringOption(option =>
            option
                .setName("choices")
                .setDescription("Each choice must be separated by a comma.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute({ interaction, args }) {
        // Get their choices.
        const choiceStr: string | null = args.getString("choices");
        if (choiceStr == null) {
            return interaction.followUp("Something went wrong. Sorry!");
        };

        // As it's a string, we need to split it into a list using a comma as a split character.
        const choices: Array<string> = choiceStr.split(',').filter(v => v.length > 0);

        // Ensure that the filtered choice list isn't empty.
        if (!choices) {
            return interaction.followUp("Something went wrong. Sorry!");
        };

        // Choose at random. 
        const decision: string = choices[Math.floor(Math.random() * choices.length)];

        // Trim it to ensure that there is no whitespace
        // at the start or end of the string.
        decision.trim();

        // Create an embed to display the result.
        const embed = new EmbedBuilder()
            .setTitle(":game_die: Pick")
            .addFields(
                { name: "Your choices:", value: choiceStr },
                { name: "My decision:", value: decision },
            );
        
        // Send the embed.
        interaction.followUp({ embeds: [embed] });
    }
});
