import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import TTLocalizer from "../../resources/toontown_localizer.json";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("toonspeak")
        .setDescription("Generate a random phrase from all dialogue used in Toontown Online.")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute({ interaction }) {
        let result = TTLocalizer[Math.floor(Math.random() * TTLocalizer.length)]
            .replaceAll("_avName_", interaction.member.displayName);

        return interaction.followUp(result);
    }
});
