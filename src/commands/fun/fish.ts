import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";

import FishData from "../../resources/fish.json";


// String map for fish genus image hyperlinks.
const FISH_IMAGES: { [index: string]: any; } = {
    0: "https://toonhq.org/static/assets/fish/balloonfish.png",
    1: "https://toonhq.org/static/assets/fish/jellyfish.png",
    2: "https://toonhq.org/static/assets/fish/catfish.png",
    3: "https://toonhq.org/static/assets/fish/clownfish.png",
    4: "https://toonhq.org/static/assets/fish/frozenfish.png",
    5: "https://toonhq.org/static/assets/fish/starfish.png",
    6: "https://toonhq.org/static/assets/fish/holeymackerel.png",
    7: "https://toonhq.org/static/assets/fish/dog.png",
    8: "https://toonhq.org/static/assets/fish/devilray.png",
    9: "https://toonhq.org/static/assets/fish/amoreeel.png",
    10: "https://toonhq.org/static/assets/fish/nurseshark.png",
    11: "https://toonhq.org/static/assets/fish/kingcrab.png",
    12: "https://toonhq.org/static/assets/fish/moonfish.png",
    13: "https://toonhq.org/static/assets/fish/seahorse.png",
    14: "https://toonhq.org/static/assets/fish/poolshark.png",
    15: "https://toonhq.org/static/assets/fish/bearacuda.png",
    16: "https://toonhq.org/static/assets/fish/cuttthroat.png",
    17: "https://toonhq.org/static/assets/fish/pianofish.png",
};

// String map for rarity names.
const FISH_RARITIES: { [index: string]: any; } = {
    1: "Very Common",
    2: "Very Common",
    3: "Common",
    4: "Common",
    5: "Uncommon",
    6: "Uncommon",
    7: "Rare",
    8: "Very Rare",
    9: "Extremely Rare",
    10: "Ultra Rare",
};

const BOOT_IMAGE = "https://static.wikia.nocookie.net/toontownrewritten/images/9/94/Old_boot.png/revision/latest/scale-to-width-down/300?cb=20180831050452";

const OUNCES_PER_LB = 16;
const BOOT_CHANCE = 7;

// Placeholder value for the player's fishing rod index.
const rod = 0;


export default new Command({
    data: new SlashCommandBuilder()
        .setName("fish")
        .setDescription("Fish for some fish!")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute({ interaction, args }) {
        const randomItem = Math.random() * 100;

        // Give a % chance for a bad item.
        if (randomItem <= BOOT_CHANCE) {
            // Create a fancy embed to send.
            const embed = new EmbedBuilder()
                .setTitle("Old Boot")
                .setThumbnail(BOOT_IMAGE)
                .setDescription("You caught an Old Boot.");

            // Send the embed.
            interaction.followUp({ embeds: [embed] });
            return;
        }

        const data = FishData;
        const fishingRodRarity = 1.0 / (4.3 * (1 - (rod * 0.025)));

        let fishRarityPool = [];

        while (true) {
            // Get a random rarity from 1 to 10 and clamp it.
            let rarity = Math.max(Math.ceil(10 * (1 - Math.pow(Math.random(), fishingRodRarity))), 1);

            // Filter the array of fish based on the rarity we rolled.
            fishRarityPool = data.filter(f => f.rarity === rarity);

            // At least one fish meets the requirements.
            if (fishRarityPool.length > 0) break;
        }

        // Grab a random fish from the filtered array.
        const fish = fishRarityPool[Math.floor(Math.random() * fishRarityPool.length)];

        const [minFishWeight, maxFishWeight] = fish.weights;
        const minRodWeight = 0;
        const maxRodWeight = (rod + 1) * 4;
        
        // The weight is calculated by clamping the fish's weight range with the rod's weight range.
        const minWeight = Math.max(minFishWeight, minRodWeight);
        const maxWeight = Math.min(maxFishWeight, maxRodWeight);

        // Randomly pick a weight within the clamped weight range.
        const randNum = (Math.random() + Math.random()) / 2.0;
        const weight = Math.ceil(OUNCES_PER_LB * (minWeight + (maxWeight - minWeight) * randNum));

        // Convert it to pounds and ounces.
        const pounds = Math.floor(weight / OUNCES_PER_LB);
        const ounces = weight % OUNCES_PER_LB;

        const rarityStr = FISH_RARITIES[fish.rarity];

        // Create a fancy embed to send.
        const embed = new EmbedBuilder()
            .setTitle(fish.name)
            .setThumbnail(FISH_IMAGES[fish.genus])
            .setDescription(`\nWeight: ${pounds} lbs. ${ounces} oz.\nRarity: ${rarityStr}`);
 
        // Send the embed.
        interaction.followUp({ embeds: [embed] });
    }
});
