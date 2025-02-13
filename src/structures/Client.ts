import { 
    ApplicationCommandDataResolvable, 
    Client, 
    ClientEvents, 
    Collection, 
    EmbedBuilder, 
    GatewayIntentBits 
} from "discord.js";
import { CommandType } from "../typings/Command";
import type { RegisterCommandsOptions } from "../typings/Client";
import { Event } from "./Event";
import mongoose from "mongoose";
import glob from "glob-promise";
import { join } from "path";
import { Player } from "discord-player";
import { DefaultExtractors } from '@discord-player/extractor';


export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    constructor() {
        super({ 
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildVoiceStates
            ] 
        });
    }

    start() {
        this.registerModules();
        this.login(process.env.botToken);
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId, }: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registering ${commands.length} commands to ${guildId}.`);
        } else if (this.application != null) {
            this.application.commands.set(commands);
            console.log(`Registering ${commands.length} global commands.`);
        }
    }

    async registerModules() {
        // Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await glob.sync(join(__dirname, '..', 'commands', '*', '*{.ts, .js}').replaceAll('\\', '/'));

        commandFiles.forEach(async (filePath) => {
            const command: CommandType = await this.importFile(filePath);
            if (!command.data.name) return;

            this.commands.set(command.data.name, command);
            slashCommands.push(command.data);
        });

        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: process.env.guildId
            });
        });

        // Events
        const eventFiles = await glob.sync(join(__dirname, '..', 'events', '*{.ts,.js}').replaceAll('\\', '/'))
        eventFiles.forEach(async (filePath) => {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);
            this.on(event.event, event.run);
        });

        // Discord Player
        // Define the player here so that it can be supplied with the client object.
        const player = new Player(this);
        // Load the default extractors.
        player.extractors.loadMulti(DefaultExtractors);
        // this event is emitted whenever discord-player starts to play a track
        player.events.on('playerStart', (queue, track) => {
            // we will later define queue.metadata object while creating the queue
            let embed = new EmbedBuilder()
                .setTitle("Music Player")
                .addFields(
                    { name: "Name", value: track.title },
                    { name: "Artist", value: track.author },
                    { name: "Duration", value: track.duration }
                )
            queue.metadata.channel.send({ embeds: [embed] });
        });
        // Listen for any player errors.
        player.events.on('playerError', (queue) => {
            queue.node.stop();
            queue.metadata.channel.send("Oops! Something went wrong.");
            console.log("Player: a playerError has occurred.");
        });
        player.events.on('error', (queue) => {
            queue.node.stop();
            queue.metadata.channel.send("Oops! Something went wrong.");
            console.log("Player: an error has occurred.");
        });

        // Mongoose
        if (process.env.mongoURI) {
            // As of Mongoose v7, strictQuery needs to be false.
            mongoose.set("strictQuery", false);
            
            try {
                await mongoose.connect(process.env.mongoURI);
                console.log('Connected to MongoDB.');
            } catch {
                console.log('Could not connect to MongoDB.');
            }
        }
    }
}
