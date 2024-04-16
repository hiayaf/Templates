const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fonts = require('../../fonts.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('fonts')
        .setNameLocalizations({
            pl: 'czcionki',
            fr: 'polices',
            de: 'schriftarten'
        })
        .setDescription('Fonty')
        .setDescriptionLocalizations({
            pl: 'Fonty',
            fr: 'Polices',
            de: 'Schriftarten'
        }),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('DarkGreen').setTimestamp();
        Object.keys(fonts).forEach(function (key) {
            const text = JSON.stringify(fonts[key]);
            const obj = JSON.parse(text);
            embed.addFields(
                {
                    name: `${key}:`,
                    value: `\`\`\`${Object.values(obj).join('')}\`\`\``,
                    inline: true
                }
            ).setTitle(`Fonty (Razem: ${Object.keys(fonts).length})`);
        });
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
};