const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
        const clientVer = require('../../package.json')
        const embed = new EmbedBuilder()
            .setColor('DarkGreen')
            .setTitle('Info')
            .setTimestamp();
        var PastebinAPI = require('pastebin-js'),
            pastebin = new PastebinAPI({
                'api_dev_key': config.pastebin.key,
                'api_user_name': config.pastebin.username,
                'api_user_password': config.pastebin.password
            });
        pastebin.getPaste('SUCRpiL5').then(function (data) {
            var changelogDate = data.substring(0, data.indexOf(' '));
            console.log(changelogDate)
            const changelog = data.slice(changelogDate.length + 1);
            const date = new Date();
            date.setDate(date.getDate() + 1);
            date.setHours(0, 0, 0, 0);
            var now = Math.floor(Date.now() / 1000);
            var midnight = Math.floor(date.getTime() / 1000);
            embed.setDescription(changelog)
                .addFields(
                    { name: `Developer:`, value: `**https://github.com/hiayaf**` },
                    { name: `Wersja:`, value: `**${clientVer.version}**` },
                    { name: `Sprawdzanie dostępnych aktualizacji za:`, value: `**<t:${midnight}:R>**` },
                );
            interaction.reply({ embeds: [embed], ephemeral: true });
        }).catch(function (err) {
            console.error(err);
        });

    }
};