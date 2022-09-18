import { CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import User from "../../structures/mongodb/User";
import { ExtendedInteraction } from "../../typings/Command";
import ms from "ms";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("reminder")
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
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    execute: async ({ interaction, args }:{ interaction:ExtendedInteraction, args:CommandInteractionOptionResolver }) => {
        // Parse their arguments.
        const remindTime = args.getString("time");
        const reminder = args.getString("reminder");
        if (reminder == null || remindTime == null) {
            return interaction.followUp("Something went wrong. Sorry!");
        };

        // Find their user object. (this should exist by now, but let's make sure)
        const user = await User.findOne({ memberId: interaction.member.id });
        if (!user) {
            return interaction.followUp("Something went wrong. Sorry!");
        };
        
        // Parse the remind time they gave.
        const timestamp: number = ms(remindTime);
        
        // Turn their timestamp into a date object, adding the timestamp of the current time to it.
        const reminderDate = new Date(Date.now() + timestamp);
        
        // Get the datetime to use for the reply string.
        const reminderDateStr = reminderDate.toLocaleDateString("en-us");
        const reminderTimeStr = reminderDate.toLocaleTimeString("en-us")
        
        // Send the reply.
        interaction.followUp(
            `OK, I'll remind you about **${reminder}** on ${reminderDateStr} at ${reminderTimeStr}.`);
        
        // Create the timestamp: reminder pair which will be stored in the
        // user object.
        const remindStruct: [number, string] = [Date.now() + timestamp, reminder];
        
        // Parse the user's currently stored reminders.
        // It's stored as a JSON string, so we use JSON.parse() here.
        var reminders: Array<[number, string]>;
        if (!user.reminders) {
            reminders = [];
        } else {
            reminders = JSON.parse(user.reminders);
            if (!reminders) reminders = [];
        }
        
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
