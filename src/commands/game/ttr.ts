import axios from "axios";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { Invasion } from "../../typings/commands/game/ttr";

const TTR_POPULATION = "https://www.toontownrewritten.com/api/population";
const TTR_INVASIONS = "https://www.toontownrewritten.com/api/invasions"

export default new Command({
    data: new SlashCommandBuilder()
        .setName("ttr")
        .setDescription("Access any of the APIs offered by Toontown Rewritten.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("population")
                .setDescription("Displays the current total population, as well as the population of each district.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("invasions")
                .setDescription("Displays the districts which currently have an ongoing invasion.")
        ),
    async execute({ interaction, args }) {
        // Store the response data from the Toontown Rewritten website.
        let response;
        
        // Store the date of the last time the response data was updated.
        let lastUpdated;
        
        // Create an embed to display the information.
        const embed = new EmbedBuilder()
            .setTitle("Toontown Rewritten");
        
        switch (args.getSubcommand()) {
            case "population":
                // Get the population data from the Toontown Rewritten website.
                try {
                    response = await axios.get(TTR_POPULATION);
                } catch (error) {
                    console.log(error);
                    return;
                }

                // Display the total population.
                embed.setDescription(`**Total Population:** ${response.data.totalPopulation}`);
                
                // Population the fields with all of the district population data.
                for (const [key, value] of Object.entries(response.data.populationByDistrict)) {
                    // Also get the online status of the district to display.
                    const onlineStatus: string = response.data.statusByDistrict[key];

                    embed.addFields({
                        name: `${key} (${onlineStatus})`,
                        value: `${value}`,
                        inline: true,
                    });
                }

                // Display the last time it was updated.
                lastUpdated = new Date(0);
                lastUpdated.setUTCSeconds(response.data.lastUpdated);
                embed.setFooter({
                    text: `Last updated on ${lastUpdated.toLocaleDateString()} at ${lastUpdated.toLocaleTimeString()}.`
                });
                break;
            
            case "invasions":
                try {
                    response = await axios.get(TTR_INVASIONS);
                } catch (error) {
                    console.log(error);
                    return;
                }

                const invasions: Map<string, Invasion> = new Map(Object.entries(response.data.invasions));
                
                // Population the fields with all of the district population data.
                for (const [key, value] of invasions) {
                    embed.addFields({
                        name: `${key}`,
                        value: `${value.type} (${value.progress})`,
                        inline: true,
                    });
                }

                // Display the last time it was updated.
                lastUpdated = new Date(0);
                lastUpdated.setUTCSeconds(response.data.lastUpdated);
                embed.setFooter({
                    text: `Last updated on ${lastUpdated.toLocaleDateString('en-us')} at ` + 
                    `${lastUpdated.toLocaleTimeString('en-us')}.`
                });
                break;
        }

        // Send the embed.
        await interaction.followUp({ embeds: [embed] });
    }
});
