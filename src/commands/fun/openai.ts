import { CommandInteractionOptionResolver, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import { Command } from "../../structures/Command";
import { ExtendedInteraction } from "../../typings/Command";

// Set up OpenAI.
const configuration = new Configuration({
    apiKey: process.env.openaiKey,
});
const openai = new OpenAIApi(configuration);

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
    execute: async ({ interaction, args }:{interaction:ExtendedInteraction, args: CommandInteractionOptionResolver}) => {
        const prompt: string | null = args.getString("prompt");
        if (prompt == null) {
            return interaction.followUp("Something went wrong. Sorry!");
        };

        const completion = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: prompt,
            temperature: 0.9,
            max_tokens: 512,
        });

        // Ensure that there are choices.
        const choices = completion.data.choices;
        if (choices == undefined) {
            return interaction.followUp("Something went wrong. Sorry!");
        };

        // Ensure that the text field is defined.
        const response: string | undefined = choices[0].text;
        if (response == undefined) {
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
