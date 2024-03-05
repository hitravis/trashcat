import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { useMainPlayer, useQueue } from "discord-player";


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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("queue")
                .setDescription("Lists all of the songs currently in the queue.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("skip")
                .setDescription("Skips the currently playing song.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("pause")
                .setDescription("Pauses the currently playing song.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("resume")
                .setDescription("Resumes the currently playing song.")
        ),
    async execute({ interaction, args }) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (channel === null) {
            return interaction.followUp("You need to be in a voice channel to use this command.");
        };
        
        // Some of the commands require the queue, which requires a guildId to find.
        const guildId = interaction.guildId;
        if (guildId === null) {
            return interaction.followUp("Something went wrong.")
        }
        const queue = useQueue(guildId);

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
                        },
                        requestedBy: interaction.user
                    });

                    return interaction.followUp(`**${track.title}** enqueued!`);
                } catch (e) {
                    // let's return error if something failed
                    console.log(e);
                    return interaction.followUp(`Something went wrong: error code 1`);
                }

            case "queue":
                const embed = new EmbedBuilder().setTitle("Music Player");
                
                // Set description based on if there's a track currently playing.
                if (!queue?.currentTrack) {
                    embed.setDescription("Currently playing: nothing");
                } else {
                    embed.setDescription(`Currently playing: ${queue.currentTrack}`)
                }

                // Compile a list of songs that are in the queue.
                let trackList: string[] = [];
                let trackNum = 1;
                queue?.tracks.data.forEach(track => {
                    if (trackNum <= 10) {
                        trackList.push(`${trackNum}: **${track.title} by ${track.author}** (${track.duration})`);
                        trackNum += 1;
                    }
                });
                
                // Combine the track list.
                let trackListStr = trackList.join('\n');

                // Since we only show the first 10 values, make sure we display the amount we aren't showing.
                let trackAmount = queue?.tracks.data.length;
                if (trackAmount !== undefined && trackAmount > 10) {
                    let trackListExtra = `\n**...and ${trackAmount - 10} more**`;
                    trackListStr += trackListExtra;
                }
                
                // Set the description.
                embed.setDescription(trackListStr);

                // Edit the footer based on the current size of the queue.
                const size = queue?.getSize();
                if (size !== undefined) {
                    if (size === 1) {
                        embed.setFooter({ text: `There is currently ${size} song in the queue.` })
                    } else {
                        embed.setFooter({ text: `There are currently ${size} songs in the queue.` })
                    }
                }

                return interaction.followUp({ embeds: [embed] });

            case "skip":
                // Ensure the queue is currently playing something.
                if (!queue?.isPlaying()) {
                    return interaction.followUp("No songs are currently playing.");
                }

                queue?.node.skip();
                return interaction.followUp("Skipped the currently playing song.");

            case "pause":
                // Ensure the queue isn't already paused.
                if (queue?.node.isPaused()) {
                    return interaction.followUp("Nothing is currently playing.");
                }

                queue?.node.pause();
                return interaction.followUp("Paused the current song.")

            case "resume":
                // Ensure the queue is paused.
                if (!queue?.node.isPaused()) {
                    return interaction.followUp("The player isn't currently paused.")
                }

                queue?.node.resume();
                return interaction.followUp("Resumed the current song.");
            
            case "stop":
                queue?.node.stop();
                return interaction.followUp("See you later!");

            default:
                return interaction.followUp("Something went wrong. Sorry!");
        }
    }
});
