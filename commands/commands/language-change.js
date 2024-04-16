const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('change_language')
        .setNameLocalizations({
            pl: 'zmien_jezyk',
            fr: 'changer_langue',
            de: 'sprache_ändern'
        })
        .setDescription('Change language')
        .setDescriptionLocalizations({
            pl: 'Zmień język',
            fr: 'Changer la langue',
            de: 'Sprache ändern'
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
            const mysql = require('mysql');
            const dbconfig = {
                host: 'serwer2396112.home.pl',
                user: '37533466_templates',
                password: '22WtY5t2bvrkNS2',
                database: '37533466_templates',
            };
            let database;

            // Obsługa błędów bazy danych
            function handleDatabaseError(err) {
                const now = new Date();
                const timestamp = now.toLocaleString();
                const data = `${timestamp} Wystąpił nieoczekiwany błąd bazy danych:\n${err}\n`;
                fs.access('logs.txt', (accessErr) => {
                    if (accessErr) {
                        fs.writeFile('logs.txt', '', (writeErr) => {
                            if (writeErr) {
                                console.error(writeErr);
                                return;
                            }
                            fs.appendFile('logs.txt', data, (appendErr) => {
                                if (appendErr) {
                                    console.error(appendErr);
                                    return;
                                }
                            });
                        });
                    } else {
                        fs.appendFile('logs.txt', data, (appendErr) => {
                            if (appendErr) {
                                console.error(appendErr);
                                return;
                            }
                        });
                    }
                });
            }

            function initializeDatabaseConnection() {
                database = mysql.createConnection(dbconfig);
                database.connect((err) => {
                    if (err) {
                        console.error('Błąd połączenia z bazą danych:', err.stack);
                        return;
                    }
                    console.log('Połączenie z bazą danych zostało nawiązane.');
                });
                setTimeout(() => {
                    database.end(function (err) {
                        if (err) {
                            console.error('Błąd zamknięcia połączenia:', err.stack);
                            return;
                        }
                        console.log('Połączenie z bazą danych zostało zamknięte.');
                    });
                }, 200)
                // Obsługa błędów połączenia z bazą danych
                database.on('error', function (err) {
                    console.error('Błąd połączenia z bazą danych:', err);
                    handleDatabaseError(err);
                });
            }

            initializeDatabaseConnection();
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