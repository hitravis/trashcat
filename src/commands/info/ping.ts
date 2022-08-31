import { Command } from "../../structures/Command";

export default new Command({
    name: "ping",
    description: "Replies with pong.",
    run: async ({ interaction }) => {
        interaction.followUp("Pong");
    }
})