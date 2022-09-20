import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";

enum SlotOptions {
    Cherry = ":cherries:",
    Star = ":star:",
    Apple = ":apple:",
    Tangerine = ":tangerine:",
    Grape = ":grapes:",
    Strawberry = ":strawberry:",
};

export default new Command({
    data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription("Try your luck at the Trashcat Casino!"),
    async execute({ interaction }) {
        const choices = Object.values(SlotOptions);
        const results = [];
        const resultAmounts: Map<SlotOptions, number> = new Map();

        // Choose 3 random fruits.
        for (let i = 0; i < 3; i++) {
            let choice = choices[Math.floor(Math.random() * choices.length)];
            let amount = resultAmounts.get(choice);

            // Ensure that the amount gets set to 0 if it's undefined.
            amount = amount === undefined ? 0 : amount;
            resultAmounts.set(choice, amount + 1);

            // Append it to a list of results.
            results.push(choice);
        }

        // Display if we won if we got 2 or more of a choice.
        const resultStr = Math.max(...resultAmounts.values()) >= 2 ? 'You won!' : 'You lost.';

        // Create an embed to display the result.
        const embed = new EmbedBuilder()
            .setTitle("Slots")
            .setDescription(results.join(" "))
            .addFields({ name: 'Result:', value: resultStr });
        
        // Display the result.
        await interaction.followUp({ embeds: [embed] });
    }
});
