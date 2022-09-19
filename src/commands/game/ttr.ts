import axios from "axios";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";

const TTR_POPULATION = "https://www.toontownrewritten.com/api/population";

export default new Command({
    data: new SlashCommandBuilder()
        .setName("ttr")
        .setDescription("Access any of the APIs offered by Toontown Rewritten.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("population")
                .setDescription("population")
        ),
    async execute({ interaction, args }) {
        switch (args.getSubcommand()) {
            case "population":
                // Get the population data from the Toontown Rewritten website.
                let response;
                try {
                    response = await axios.get(TTR_POPULATION);
                } catch (error) {
                    console.log(error);
                    return;
                }

                // Create an embed to display the population.
                const embed = new EmbedBuilder()
                    .setTitle("Toontown Rewritten")
                    .setDescription(`**Total Population:** ${response.data.totalPopulation}`);
                
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
                
                // Send the embed.
                await interaction.followUp({ embeds: [embed] });
                break;
        }
    }
});
