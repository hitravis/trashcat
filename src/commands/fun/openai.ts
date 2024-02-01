import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { OpenAI } from "openai";
import { Command } from "../../structures/Command";

// Setup OpenAI.
const openai = new OpenAI({
    apiKey: process.env.openaiKey
});


export default new Command({
    data: new SlashCommandBuilder()
        .setName("openai")
        .setDescription("The Trashcat is wise. Why not put that to the test?")
        .addStringOption(option =>
            option
                .setName("prompt")
                .setDescription("prompt")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute({ interaction, args }) {
        const prompt: string | null = args.getString("prompt");
        if (prompt == null) {
            return interaction.followUp("Something went wrong. Sorry!");
        };
        
        let completion;
        try {
            completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.9,
                max_tokens: 512,
            });
        } catch (err: unknown) {
            // If the error is something we can parse...
            if (err instanceof Error) {
                return interaction.followUp(`An error has occurred: ${err.message}`);
            }

            // Otherwise just sent a default error message.
            return interaction.followUp("Something went wrong. Sorry!");
        }

        // Ensure that there are choices.
        const choices = completion.choices;
        if (choices == undefined) {
            return interaction.followUp("Something went wrong. Sorry!");
        };

        // Ensure that the text field is defined.
        const response: string | null = choices[0].message.content;
        if (response == null) {
            return interaction.followUp("Something went wrong. Sorry!");
        };

        // Create an embed to display the result.
        const embed = new EmbedBuilder()
            .setTitle("OpenAI")
            .addFields(
                { name: "You said:", value: prompt },
                { name: "My response:", value: response }
            );

        // Send the embed.
        interaction.followUp({ embeds: [embed] });
    }
});
