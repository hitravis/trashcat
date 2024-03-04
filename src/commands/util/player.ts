import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { useMainPlayer } from "discord-player";


export default new Command({
    data: new SlashCommandBuilder()
        .setName("player")
        .setDescription("Play a song!")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Add a song to the queue.")
                .addStringOption(option =>
                    option
                        .setName("query")
                        .setDescription("The query.")
                        .setRequired(true)
                )
        ),
    async execute({ interaction, args }) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (channel === null) {
            return interaction.followUp("You need to be in a voice channel to use this command.");
        };

        switch (args.getSubcommand()) {
            case "add":
                const queryString = args.getString("query");
                if (queryString === null) {
                    return interaction.followUp("No query string was provided.")
                }
                const query = await player.search(queryString);
                if (query.isEmpty()) {
                    return interaction.followUp(`Could not find any results for query: ${queryString}`);
                }

                try {
                    const { track } = await player.play(channel, query, {
                        nodeOptions: {
                            // nodeOptions are the options for guild node (aka your queue in simple word)
                            metadata: interaction // we can access this metadata object using queue.metadata later on
                        }
                    });
            
                    return interaction.followUp(`**${track.title}** enqueued!`);
                } catch (e) {
                    // let's return error if something failed
                    return interaction.followUp(`Something went wrong: ${e}`);
                }
            default:
                return interaction.followUp("Something went wrong. Sorry!");
        }
    }
});
