const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ogloszenie')
        .setDescription('Wyślij ogłoszenie w postaci embeda')
        .addStringOption(option =>
            option.setName('tytul')
                .setDescription('Tytuł ogłoszenia')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('opis')
                .setDescription('Opis ogłoszenia')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('wszystkie_serwery')
                .setDescription('Wyślij na wszystkie serwery?')
                .setRequired(true)),
    async execute(interaction) {
        const { options, guild } = interaction;
        const tytul = options.getString('tytul');
        const opis = options.getString('opis');
        const wszystkieSerwery = options.getBoolean('wszystkie_serwery');

        if (!tytul || !opis) {
            return interaction.reply({ content: 'Proszę podaj zarówno tytuł, jak i opis.', ephemeral: true });
        }

        const { MessageEmbed } = require('discord.js');
        const embed = new MessageEmbed()
            .setColor('DarkGreen')
            .setTitle(tytul)
            .setDescription(opis)
            .setTimestamp();

        if (wszystkieSerwery) {
            interaction.client.guilds.cache.forEach(guild => {
                const channelToSend = guild.systemChannel || guild.channels.cache.filter(channel => channel.type === 'text').first();
                if (channelToSend) {
                    channelToSend.send({ embeds: [embed] });
                }
            });
        } else {
            const channelToSend = guild.systemChannel || interaction.channel;
            if (channelToSend) {
                channelToSend.send({ embeds: [embed] });
            }
        }

        interaction.reply({ content: 'Ogłoszenie zostało wysłane.', ephemeral: true });
    },
};
