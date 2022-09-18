import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription(
            "Check out how fast the Trashcat is operating at the moment. (less ms means a faster connection)"),
    async execute({ client, interaction }) {
        // Print out the ping of the client's websocket.
        interaction.followUp(`${client.ws.ping}ms`);
    }
});
