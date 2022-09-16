import { CommandInteractionOptionResolver } from "discord.js";
import mongoose from "mongoose";
import { client } from "..";
import { Event } from "../structures/Event";
import User from "../structures/mongodb/User";
import { ExtendedInteraction } from "../typings/Command";


export default new Event('interactionCreate', async (interaction) => {
    // Attempt to create a new user entry in the database.
    const user = await User.findOne({ memberId: interaction.user.id });
    if (user == null) {
        const newUser = await new User({
            _id: new mongoose.Types.ObjectId(),
            memberId: interaction.user.id,
        });
        await newUser.save().catch(error => console.log(error));
    };

    // Chat input commands
    if (interaction.isCommand()) {
        await interaction.deferReply();
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.followUp("You have used a non-existant command.");
        try {
            command.execute({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction,
            });
        } catch (error) {
            console.log(error);
        }
    }
});
