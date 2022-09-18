import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import User from "../../structures/mongodb/User";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("currency")
        .setDescription("Show how many coins a user currently has.")
        .addUserOption(option => 
            option
                .setName("member")
                .setDescription("member")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute({ interaction, args }) {
        let member = args.getUser("member");
        let user, username;
        // Find their user object. (this should exist by now, but let's make sure)
        if (!member) {
            user = await User.findOne({ memberId: interaction.member.id });
            username = interaction.member.displayName;
        } else {
            user = await User.findOne({ memberId: member.id });
            username = member.username;
        }

        // Default to 0 if a user object doesn't exist for them yet.
        let currency: number;
        if (!user) {
            currency = 0;
        } else {
            currency = user.currency;
        }

        // Ensure that the 'coins' string is pluralized properly.
        let plural;
        if (currency == 1) {
            plural = '';
        } else plural = 's';
        
        // Create an embed to display the result.
        const embed = new EmbedBuilder()
            .setAuthor({ name: username })
            .setTitle("Currency")
            .setDescription(`**${currency}** Coin${plural}`);

        // Send the embed.
        await interaction.followUp({ embeds: [embed] });
    }
});
