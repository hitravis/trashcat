import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("say")
        .setNameLocalization("ja", "言い返す")
        .setDescription("The Trashcat will repeat what you say.")
        .setDescriptionLocalization("ja", "ゴミ猫があなたの言葉を言い返します。")
        .addStringOption(option =>
            option
                .setName("prompt")
                .setDescription("prompt")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute({ interaction, args }) {
        // Grab their prompt.
        const prompt: string | null = args.getString("prompt");
        if (prompt == null) {
            return interaction.followUp("Something went wrong. Sorry!");
        };
        
        // Repeat.
        interaction.followUp(prompt);
    }
});
