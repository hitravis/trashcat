import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";

// The possible choices.
const choices = ["rock", "paper", "scissors"];

// Map of each choice with it's associated win condition.
const winConditions = new Map([
    ["rock", "scissors"],
    ["paper", "rock"],
    ["scissors", "paper"],
]);

// Map of each choice with an associated emoji to display.
const choiceEmojis = new Map([
    ["rock", ":rock:"],
    ["paper", ":page_facing_up:"],
    ["scissors", ":scissors:"],
]);

export default new Command({
    data: new SlashCommandBuilder()
        .setName("rps")
        .setDescription("Play Rock, Paper, Scissors with the Trashcat!")
        .addStringOption(option =>
            option
                .setName("choice")
                .setDescription("choice")
                .setRequired(true)
                .addChoices(
                    { name: "Rock", value: "Rock" },
                    { name: "Paper", value: "Paper" },
                    { name: "Scissors", value: "Scissors" },
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute({ interaction, args }) {
        // Get their choice.
        const choice = args.getString("choice")?.toLocaleLowerCase();
        if (choice == null) {
            return interaction.reply({ content: "Something went wrong. Sorry!", ephemeral: true });
        };

        // Get our choice.
        const result = choices[Math.floor(Math.random() * choices.length)];

        // Create the outcome string.
        let resultStr = `${choice.toUpperCase()} ${choiceEmojis.get(choice)} vs `;
        resultStr += `${choiceEmojis.get(result)} ${result.toUpperCase()}\n\n`;

        // If their choise and our result is the same, it's a tie.
        if (choice == result) {
            resultStr += "It's a tie.";
        // If our choice is in their win conditions, they won.
        } else if (winConditions.get(choice) === result) {
            resultStr += 'You win!';
        // Otherwise, they lost.
        } else {
            resultStr += 'You lost.';
        }

        // Create an embed to display the result.
        const embed = new EmbedBuilder()
            .setTitle('Rock, Paper, Scissors')
            .setDescription(resultStr);

        // Send the embed.
        interaction.followUp({ embeds: [embed] });
    }
});
