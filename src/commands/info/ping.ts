import { Command } from "../../structures/Command";

export default new Command({
    name: "ping",
    description: "Check out how fast Trashcat is at the moment. (less ms means a faster connection)",
    run: async ({ client, interaction }) => {
        // Print out the ping of the client's websocket.
        interaction.followUp(`${client.ws.ping}ms`);
    }
})
