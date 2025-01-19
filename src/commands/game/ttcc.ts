import axios from "axios";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { DistrictPopulationData, GameInfo } from "../../typings/commands/game/ttcc";

const TTCC_POPULATION = "https://corporateclash.net/api/v1/districts.js";
const TTCC_INFO = "https://corporateclash.net/api/v1/game_info.js";

export default new Command({
    data: new SlashCommandBuilder()
        .setName("ttcc")
        .setDescription("Access any of the APIs offered by Toontown: Corporate Clash.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("population")
                .setDescription("Displays the current total population, as well as the population of each district.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("invasions")
                .setDescription("Displays the districts which currently have an ongoing invasion.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("info")
                .setDescription("Display information about the gameserver, including version, total population, etc.")
        ),
    async execute({ interaction, args }) {
        // Store the date of the last time the response data was updated.
        let lastUpdated;
        
        // Create an embed to display the information.
        const embed = new EmbedBuilder()
            .setTitle("Toontown: Corporate Clash");
        
        switch (args.getSubcommand()) {
            case "population":
                // Get the population data from the Toontown: Corporate Clash website.
                let popResponse;
                let popResponseData: Array<DistrictPopulationData>;
                try {
                    popResponse = await axios.get(TTCC_POPULATION);
                    popResponseData = popResponse.data;
                } catch (error) {
                    console.log(error);
                    return;
                }

                // Display the total population.
                let totalPopulation = popResponseData.reduce((n, {population}) => n + population, 0);
                embed.setDescription(`**Total Population:** ${totalPopulation}`);
                
                // Population the fields with all of the district population data.
                popResponseData.forEach(district => {
                    const population = district.population;
                    const name = district.name;
                    // Also get the online status of the district to display.
                    const onlineStatus: boolean = district.online;
                    
                    // Select an emoji to represent the fullness of the district. These values mirror the ones seen
                    // in the actual game's shard page.
                    let displayEmoji: string;
                    if (population < 75) {
                        displayEmoji = ":blue_circle:";
                    } else if (population < 300) {
                        displayEmoji = ":green_circle:";
                    } else {
                        displayEmoji = ":red_circle:";
                    }

                    embed.addFields({
                        name: `${displayEmoji} ${name} (${onlineStatus})`,
                        value: `${population}`,
                        inline: true,
                    });
                });

                // Display the last time it was updated.
                lastUpdated = new Date(0);
                lastUpdated.setUTCSeconds(popResponseData[0].last_update);
                embed.setFooter({
                    text: `Last updated on ${lastUpdated.toLocaleDateString()} at ${lastUpdated.toLocaleTimeString()}.`
                });
                break;
            
            case "invasions":
                // Get the invasion data from the Toontown: Corporate Clash website.
                let invasionResponse;
                let invasionResponseData: Array<DistrictPopulationData>;
                try {
                    invasionResponse = await axios.get(TTCC_POPULATION);
                    invasionResponseData = invasionResponse.data;
                } catch (error) {
                    console.log(error);
                    return;
                }
                
                // Population the fields with all of the district population data.
                invasionResponseData.forEach(district => {
                    const name = district.name;

                    embed.addFields({
                        name: `${name} (${district.invasion_online})`,
                        value: `${district.cogs_attacking} (${district.count_defeated} / ${district.count_total})`,
                        inline: true,
                    });
                });

                // Display the last time it was updated.
                lastUpdated = new Date(0);
                lastUpdated.setUTCSeconds(invasionResponseData[0].last_update);
                embed.setFooter({
                    text: `Last updated on ${lastUpdated.toLocaleDateString()} at ${lastUpdated.toLocaleTimeString()}.`
                });
                break;
            
            case "info":
                // Get the game info data from the Toontown: Corporate Clash website.
                let infoResponse;
                let infoResponseData: GameInfo;
                try {
                    infoResponse = await axios.get(TTCC_INFO);
                    infoResponseData = infoResponse.data;
                } catch (error) {
                    console.log(error);
                    return;
                }
                
                // Create a helpful description based on the data received.
                let gameStatus = infoResponseData.production_closed ? 'Offline' : 'Online';
                let desc = "";
                desc += `Total Population: ${infoResponseData.num_toons}`;
                desc += `\nVersion: ${infoResponseData.version}`;
                desc += `\nGame Status: ${gameStatus}`;
                if (infoResponseData.production_closed) {
                    desc += `\nDown Reason: ${infoResponseData.production_closed_reason}`
                }
                embed.setDescription(desc);
                break;
        }

        // Send the embed.
        await interaction.followUp({ embeds: [embed] });
    }
});
