const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('license')
        .setNameLocalizations({
            pl: 'licencja',
            fr: 'licence',
            de: 'lizenz'
        })
        .setDescription('Licencja')
        .setDescriptionLocalizations({
            pl: 'Licencja',
            fr: 'Licence',
            de: 'Lizenz'
        }),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('license')
            .setTitle('Licencja');

        const licenceInput = new TextInputBuilder()
            .setCustomId('lccode')
            .setLabel("Kod licencji")
            .setPlaceholder('XXXX-XXXX-XXXX-XXXX-XXXX')
            .setMaxLength(22)
            .setStyle(TextInputStyle.Short);
        const firstActionRow = new ActionRowBuilder().addComponents(licenceInput);

        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
};
