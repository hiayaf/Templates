const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('release')
        .setNameLocalizations({
            pl: 'wydanie',
            fr: 'version',
            de: 'veröffentlichung'
        })
        .setDescription('Changelog and more')
        .setDescriptionLocalizations({
            pl: 'Dziennik zmian i więcej',
            fr: 'Changelog et plus',
            de: 'Änderungsprotokoll und mehr'
        }),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('DarkGreen')
            .setTitle('Info')
            .setTimestamp();

        try {
            const response = await axios.get('https://lj-company.pl/templates/changelog.txt');
            const data = response.data;

            const changelogDate = data.substring(0, data.indexOf(' '));
            const changelog = data.slice(changelogDate.length + 1);

            const date = new Date();
            date.setDate(date.getDate() + 1);
            date.setHours(0, 0, 0, 0);
            const midnight = Math.floor(date.getTime() / 1000);

            embed.setDescription(changelog)
                .addFields(
                    { name: 'Developer:', value: '**[Developer GitHub](https://github.com/hiayaf/)**' },
                    { name: 'Sprawdzanie dostępnych aktualizacji za:', value: `**<t:${midnight}:R>**` }
                );

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Błąd podczas pobierania danych:', error);
            interaction.reply('Wystąpił błąd podczas pobierania danych.');
        }
    }
};
