const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('change_language')
        .setNameLocalizations({
            pl: 'zmien_jezyk',
            fr: 'changer_langue',
            de: 'sprache_ändern'
        })
        .setDescription('Update information in the database')
        .setDescriptionLocalizations({
            pl: 'Aktualizuj informacje w bazie danych',
            fr: 'Mettre à jour les informations dans la base de données',
            de: 'Aktualisiere Informationen in der Datenbank'
        })
        .addStringOption(option =>
            option
                .setName('language')
                .setDescription('Language to update')
                .setDescriptionLocalizations({
                    pl: 'Język do zaktualizowania',
                    fr: 'Langue à mettre à jour',
                    de: 'Sprache zum Aktualisieren'
                })
                .setRequired(true)
                .addChoices(
                    { name: 'Français', value: 'fr' },
                    { name: 'Deutsch', value: 'de' },
                    { name: 'Polski', value: 'pl' }
                )
        ),
    async execute(interaction) {
        const language = interaction.options.getString('language').slice(0, 2);
        const languages = ['fr', 'de', 'pl'];
        const languageMessages = {
            fr: {
                successMessage: 'Langue modifiée avec succès en français.'
            },
            de: {
                successMessage: 'Erfolgreich die Sprache zu Deutsch geändert.'
            },
            pl: {
                successMessage: 'Pomyślnie zmieniono język na polski.'
            }
        };
        if (!languages.includes(language.toLowerCase())) {
            return interaction.reply({ content: 'Nieprawidłowy język. Wybierz francuski (FR), niemiecki (DE) lub polski (PL).', ephemeral: true });
        } else {
            const database = require('../index').database;
            database.query(`SELECT * FROM lang WHERE user = '${interaction.user.id}'`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    database.query(`UPDATE lang SET language='${language}' WHERE user = '${interaction.user.id}'`);
                } else {
                    database.query(`INSERT INTO lang(user, language) VALUES ('${interaction.user.id}','${language}')`);
                };
                interaction.reply({ content: languageMessages[language].successMessage, ephemeral: true });
            });
        };
    }
};