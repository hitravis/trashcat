import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import User from "../../structures/mongodb/User";
import ms from "ms";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription("Set a reminder, of which you will be DM'd at the specified time.")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Set a reminder, of which you will be DM'd at the specified time.")
                .addStringOption(option =>
                    option
                        .setName("time")
                        .setDescription("time")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("reminder")
                        .setDescription("reminder")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("Lists all of your current reminders.")
        ),
    async execute({ interaction, args }) {
        // Find their user object. (this should exist by now, but let's make sure)
        const user = await User.findOne({ memberId: interaction.member.id });
        if (!user) {
            return interaction.followUp("Something went wrong. Sorry!");
        };

        // Parse the user's currently stored reminders.
        // It's stored as a JSON string, so we use JSON.parse() here.
        var reminders: Array<[number, string]>;
        if (!user.reminders) {
            reminders = [];
        } else {
            reminders = JSON.parse(user.reminders);
            if (!reminders) reminders = [];
        }

        // Handle the list subcommand.
        if (args.getSubcommand() == "list") {
            if (reminders.length > 0) {
                const plural = reminders.length === 1 ? '' : 's';
    
                const embed = new EmbedBuilder()
                    .setTitle("Reminders")
                    .setDescription(`You have ${reminders.length} reminder${plural}.`);
                
                reminders.forEach((remindStruct: [number, string]) => {
                    // Embeds can only have a max of 25 fields.
                    if (embed.data.fields != undefined && embed.data.fields.length > 25) return;

                    // Grab the timestamp and reminder from the array.
                    const timestamp: number = remindStruct[0];
                    const reminder: string = remindStruct[1];
                    const timestampDate = new Date(timestamp);

                    // Get the datetime to use for the reply string.
                    const reminderDateStr = timestampDate.toLocaleDateString("en-us");
                    const reminderTimeStr = timestampDate.toLocaleTimeString("en-us");

                    embed.addFields({ 
                        name: `On ${reminderDateStr} at ${reminderTimeStr}`,
                        value: reminder,
                    });
                });
                
                // Display the amount of hidden reminders.
                if (reminders.length > 25) {
                    embed.setFooter({
                        text: `...and ${25 - reminders.length} more.`
                    })
                };
    
                await interaction.followUp({ embeds: [embed] });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle("Reminders")
                .setDescription(`You do not have any active reminders.`);

            await interaction.followUp({ embeds: [embed] });
            return;
        };

        // Parse their arguments.
        const remindTime = Number(args.getString("time"));
        const reminder = args.getString("reminder");
        if (reminder == null || remindTime == null) {
            return interaction.followUp("Something went wrong. Sorry!");
        };
        
        // Parse the remind time they gave.
        const timestamp: number = Number(ms(remindTime));
        
        // Turn their timestamp into a date object, adding the timestamp of the current time to it.
        const reminderDate = new Date(Date.now() + timestamp);
        
        // Get the datetime to use for the reply string.
        const reminderDateStr = reminderDate.toLocaleDateString("en-us");
        const reminderTimeStr = reminderDate.toLocaleTimeString("en-us");
        
        // Send the reply.
        interaction.followUp(
            `OK, I'll remind you about **${reminder}** on ${reminderDateStr} at ${reminderTimeStr}.`);
        
        // Create the timestamp: reminder pair which will be stored in the
        // user object.
        const remindStruct: [number, string] = [Date.now() + timestamp, reminder];
        
        // Add the new reminder to the array.
        reminders.push(remindStruct);
        
        // Save their new reminders as a JSON string.
        user.reminders = JSON.stringify(reminders);
        await user.save();

        // Setup the timeout which will send a DM to them about their reminder. 
        setTimeout(async () => {
            interaction.member.send(`Hey, I'm reminding you about this: **${reminder}**`);
            user.reminders = JSON.stringify(reminders.filter(r => r != remindStruct));
            await user.save();
        }, timestamp);
    }
});
