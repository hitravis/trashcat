import { SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "../../structures/Client";
import { Command } from "../../structures/Command";
import { ExtendedInteraction } from "../../typings/Command";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription(
            "Check out how fast the Trashcat is operating at the moment. (less ms means a faster connection)"),
    execute: async ({ client, interaction }:{client:ExtendedClient, interaction:ExtendedInteraction}) => {
        // Print out the ping of the client's websocket.
        interaction.followUp(`${client.ws.ping}ms`);
    }
});
