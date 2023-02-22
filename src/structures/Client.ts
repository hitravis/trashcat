import { 
    ApplicationCommandDataResolvable, 
    Client, 
    ClientEvents, 
    Collection, 
    GatewayIntentBits 
} from "discord.js";
import { CommandType } from "../typings/Command";
import type { RegisterCommandsOptions } from "../typings/Client";
import { Event } from "./Event";
import mongoose from "mongoose";
import glob from "glob-promise";
import { join } from "path";


export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    constructor() {
        super({ 
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.DirectMessages
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
        const commandFiles = await glob(join(__dirname, '..', 'commands', '*', '*{.ts, .js}').replaceAll('\\', '/'));

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
        const eventFiles = await glob(join(__dirname, '..', 'events', '*{.ts,.js}').replaceAll('\\', '/'))
        eventFiles.forEach(async (filePath) => {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);
            this.on(event.event, event.run);
        });

        // Mongoose
        if (!process.env.mongoURI) return;

        // As of Mongoose v7, strictQuery needs to be false.
        mongoose.set("strictQuery", false);
        
        try {
            await mongoose.connect(process.env.mongoURI);
            console.log('Connected to MongoDB.');
        } catch {
            console.log('Something went wrong.');
        }
    }
}
