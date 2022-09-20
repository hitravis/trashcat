import axios from "axios";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { FieldOffice, Invasion } from "../../typings/commands/game/ttr";

const TTR_POPULATION = "https://www.toontownrewritten.com/api/population";
const TTR_INVASIONS = "https://www.toontownrewritten.com/api/invasions";
const TTR_FIELDOFFICES = "https://www.toontownrewritten.com/api/fieldoffices";

const zoneIdToName = new Map([
    ["3100", "Walrus Way"],
    ["3200", "Sleet Street"],
    ["3300", "Polar Place"],
    ["4100", "Alto Avenue"],
    ["4200", "Baritone Boulevard"],
    ["4300", "Tenor Terrace"],
    ["5100", "Elm Street"],
    ["5200", "Maple Street"],
    ["5300", "Oak Street"],
    ["9100", "Lullaby Lane"],
    ["9200", "Pajama Place"],
]);

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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("fo")
                .setDescription("Displays the currently available Field Offices.")
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
                // Get the invasion data from the Toontown Rewritten website.
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
                        value: `${value.type}\n(${value.progress})`,
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

            case "fo":
                // Get the field office data from the Toontown Rewritten website.
                let foData;
                try {
                    foData = (await axios.get(TTR_FIELDOFFICES)).data;
                } catch (error) {
                    console.log(error);
                    return;
                }

                const fieldoffices: Map<string, FieldOffice> = new Map(Object.entries(foData.fieldOffices));
                
                // Population the fields with all of the district population data.
                for (const [key, value] of fieldoffices) {
                    embed.addFields({
                        name: `${zoneIdToName.get(key)}`,
                        value: `Difficulty: ${value.difficulty + 1}\nAnnexes: ${value.annexes}\nOpen: ${value.open ? 'Yes' : 'No'}`,
                        inline: true,
                    });
                }

                // Display the last time it was updated.
                lastUpdated = new Date(0);
                lastUpdated.setUTCSeconds(foData.lastUpdated);
                embed.setFooter({
                    text: `Last updated on ${lastUpdated.toLocaleDateString()} at ${lastUpdated.toLocaleTimeString()}.`
                });
                break;
        }

        // Send the embed.
        await interaction.followUp({ embeds: [embed] });
    }
});
