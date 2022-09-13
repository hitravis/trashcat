import { CommandInteractionOptionResolver, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedInteraction } from "../../typings/Command";

// The list of responses to choose from.
const options: Array<string> = [
    "It is certain",
    "Absolutely.",
    "Ask again later.",
    "Why are you asking me this?",
    "Maybe you should ask a family member about that instead.",
    "Yes.",
    "No.",
    "Certainly not.",
    "The answer to your question is better left unspoken.",
    "Huh?",
    "That is a foolish question to ask.",
];

export default new Command({
    data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("The Trashcat will decide your fate.")
        .addStringOption(option => 
            option
                .setName("question")
                .setDescription("question")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    execute: async ({ interaction, args }:{interaction:ExtendedInteraction, args:CommandInteractionOptionResolver}) => {
        // Store the question.
        const question: string | null = args.getString("question")
        if (question == null) return;

        // Choose a random response and store it.
        const response: string = options[Math.floor(Math.random() * options.length)]

        // Create a fancy embed to send.
        const embed = new EmbedBuilder()
            .setTitle(":8ball: 8ball")
            .addFields(
                { name: 'You asked:', value: question },
                { name: 'Your answer:', value: response },
            );
 
        // Send the embed.
        interaction.followUp({ embeds: [embed] });
    }
});
