const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const util = require('util');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('updates_channel')
        .setDescription('Set the updates channel ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to echo into')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .setDMPermission(false),
    async execute(interaction) {
        const mysql = require('mysql');
        const dbconfig = {
            host: 'localhost',
            user: 'root',
            password: '',
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
            }, 500)
            // Obsługa błędów połączenia z bazą danych
            database.on('error', function (err) {
                console.error('Błąd połączenia z bazą danych:', err);
                handleDatabaseError(err);
            });
        }

        initializeDatabaseConnection();
        const langCode = interaction.locale.slice(0, 2);
        const translationPath = path.resolve(__dirname, `../../translations/${langCode}.json`);
        const defaultTranslationPath = path.resolve(__dirname, '../../translations/en.json');
        let lang;
        const queryPromise = util.promisify(database.query).bind(database);
        try {
            const rows = await queryPromise(`SELECT * FROM lang WHERE user = '${interaction.user.id}'`);
            if (rows.length) {
                const userLangCode = rows[0].language;
                const userTranslationPath = path.resolve(__dirname, `../../translations/${userLangCode}.json`);
                if (fs.existsSync(userTranslationPath)) {
                    lang = require(userTranslationPath);
                } else if (fs.existsSync(translationPath)) {
                    lang = require(translationPath);
                } else {
                    lang = require(defaultTranslationPath);
                };
            } else {
                if (fs.existsSync(translationPath)) {
                    lang = require(translationPath);
                } else {
                    lang = require(defaultTranslationPath);
                };
            };
        } catch (error) {
            interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
        };
        const channelId = interaction.options.getChannel('channel').id;

        const channel = await interaction.guild.channels.fetch(channelId);

        database.query(`SELECT * FROM update_channels WHERE guild = '${interaction.guild.id}'`, (err, rows) => {
            if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
            if (rows.length) {
                if (rows[0].channelId == channelId) return interaction.reply({ content: `Kanał ${channel} jest już ustawiony jako kanał aktualizacji.`, ephemeral: true });
                database.query(`UPDATE update_channels SET channelId='${channel.id}' WHERE guild='${interaction.guild.id}'`);
            } else {
                database.query(`INSERT INTO update_channels(guild, channelId) VALUES ('${interaction.guild.id}','${channel.id}')`);
            }
        });
        await interaction.reply({ content: `Pomyślnie ustawiono kanał ${channel} jako kanał aktualizacji.`, ephemeral: true });
    },
};