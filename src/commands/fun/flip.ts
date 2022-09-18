import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";

const choices = ["heads", "tails"];

export default new Command({
    data: new SlashCommandBuilder()
        .setName("flip")
        .setDescription("Flip a coin!")
        .addStringOption(option =>
            option
                .setName("side")
                .setDescription("side")
                .setRequired(true)
                .addChoices(
                    { name: "Heads", value: "Heads" },
                    { name: "Tails", value: "Tails" },
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute({ interaction, args }) {
        // Get their choice.
        const side = args.getString("side")?.toLocaleLowerCase();
        if (side == null) {
            return interaction.reply({ content: "Something went wrong. Sorry!", ephemeral: true });
        };

        // Get our choice.
        const result = choices[Math.floor(Math.random() * choices.length)];

        // Determine the output string based on if their choice
        // and our choice is the same.
        let resultStr = `I picked **${result.toUpperCase()}**. `;
        if (side == result) {
            resultStr += 'You win!';
        } else {
            resultStr += 'You lost.';
        }

        // Create an embed to display the result.
        const embed = new EmbedBuilder()
            .setTitle('Flip a Coin')
            .setDescription(resultStr);

        // Send the embed.
        interaction.followUp({ embeds: [embed] });
    }
});
