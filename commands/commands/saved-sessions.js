const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const util = require('util');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('saved_sessions')
        .setNameLocalizations({
            pl: 'zapisane_sesje',
            fr: 'sessions_enregistrées',
            de: 'gespeicherte_sitzungen'
        })
        .setDescription('Load saved sessions')
        .setDescriptionLocalizations({
            pl: 'Wczytaj zapisane sesje',
            fr: 'Charger les sessions enregistrées',
            de: 'Gespeicherte Sitzungen laden'
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const mysql = require('mysql');
        const dbconfig = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: '37533466_templates',
            charset: 'utf8mb4',
            collation: 'utf8mb4_unicode_ci'
        };
        let database;
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
            }, 4000)
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
                }
            } else {
                if (fs.existsSync(translationPath)) {
                    lang = require(translationPath);
                } else {
                    lang = require(defaultTranslationPath);
                }
            }
        } catch (error) {
            interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
        }
        function getUuid() {
            return new Promise(resolve => {
                database.query(`SELECT * FROM saved_sessions WHERE user='${interaction.user.id}' AND session=1`, function (err, rows) {
                    if (err) { return console.log(err) } else {
                        if (rows.length) { resolve(rows[0].uuid) } else {
                            const embed = new EmbedBuilder()
                                .setColor('DarkOrange')
                                .setTitle('Nie posiadasz zapisanych sesji!')
                                .setDescription(`**Stwórz je za pomocą komendy </create_template:1108528052281028688>**`)
                                .setTimestamp()
                                .setFooter({ text: 'Kod błędu: 4052x' })
                            return interaction.reply({ embeds: [embed], ephemeral: true })
                        }
                    }
                })
            });
        };
        function getGuildType() {
            return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user='${interaction.user.id}' AND session=1`, function (err, rows) { if (err) { return interaction.reply({ content: `Aktualnie mamy problem z naszymi serwisami... spróbuj ponownie później`, ephemeral: true }); } else { resolve(rows[0].guildtype) } }) });
        };
        function getFontType() {
            return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user='${interaction.user.id}' AND session=1`, function (err, rows) { if (err) { return interaction.reply({ content: `Aktualnie mamy problem z naszymi serwisami... spróbuj ponownie później`, ephemeral: true }); } else { resolve(rows[0].font) } }) });
        };
        function getCategoryFontType() {
            return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user='${interaction.user.id}' AND session=1`, function (err, rows) { if (err) { return interaction.reply({ content: `Aktualnie mamy problem z naszymi serwisami... spróbuj ponownie później`, ephemeral: true }); } else { resolve(rows[0].categoryfont) } }) });
        };
        function getChannelParameter() {
            return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user='${interaction.user.id}' AND session=1`, function (err, rows) { if (err) { return interaction.reply({ content: `Aktualnie mamy problem z naszymi serwisami... spróbuj ponownie później`, ephemeral: true }); } else { resolve(rows[0].channelparam) } }) });
        };
        function getChannelArray() {
            return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user='${interaction.user.id}' AND session=1`, function (err, rows) { if (err) { return interaction.reply({ content: `Aktualnie mamy problem z naszymi serwisami... spróbuj ponownie później`, ephemeral: true }); } else { resolve(rows[0].channels) } }) });
        };
        function getWelcomeDescription() {
            return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user='${interaction.user.id}' AND session=1`, function (err, rows) { if (err) { return interaction.reply({ content: `Aktualnie mamy problem z naszymi serwisami... spróbuj ponownie później`, ephemeral: true }); } else { resolve(rows[0].welcomedesc) } }) });
        };
        const uuid = await getUuid();
        const guildType = await getGuildType();
        const fontType = await getFontType();
        const categoryfontType = await getCategoryFontType();
        const channelparam = await getChannelParameter();
        const channelsarray = await getChannelArray()
        const welcomeDescription = await getWelcomeDescription();
        database.query(`SELECT * FROM saved_sessions WHERE user='${interaction.user.id}' AND session=1`, (err, rows) => {
            if (err) throw err;
            if (rows.length) {
                const guildTypes = [
                    {
                        name: 'GuildTypeFriends',
                        emoji: 'https://cdn.discordapp.com/emojis/1055628130594852874.png'
                    },
                    {
                        name: 'GuildTypeSocial',
                        emoji: 'https://cdn.discordapp.com/emojis/1055625903629140088.png'
                    },
                    {
                        name: 'GuildTypeGame',
                        emoji: 'https://cdn.discordapp.com/emojis/1055620361653342348.png'
                    }
                ];
                const emojiUrl = guildTypes.find(type => type.name === guildType)?.emoji;
                const embed = new EmbedBuilder()
                    .setTitle(`${lang.session} 1`)
                    .addFields(
                        { name: `${lang.finalization_embed.sessionUuid}`, value: `\`\`\`${uuid}\`\`\`` },
                        { name: `${lang.finalization_embed.guildType}`, value: `\`\`\`${guildType}\`\`\`` },
                        { name: `${lang.finalization_embed.fontType}`, value: `\`\`\`${fontType}\`\`\`` },
                        { name: `${lang.finalization_embed.categoryfontType}`, value: `\`\`\`${categoryfontType}\`\`\`` },
                        { name: `${lang.finalization_embed.channelParam}`, value: `\`\`\`${channelparam}\`\`\`` },
                        { name: `${lang.finalization_embed.channelArray}`, value: `\`\`\`${channelsarray.slice(0, 30).trim().replace(/,$/, '.') + '...'}\`\`\`` }
                    )
                    .setTimestamp()
                    .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.guild.iconURL({ dynamic: true, size: 4096 }) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
                    .setAuthor({ name: guildType, iconURL: emojiUrl })
                const sessionsGo = new ActionRowBuilder()
                    .addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                    .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger))
                    .addComponents(new ButtonBuilder().setCustomId('sessionMove2').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(true))
                    .addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.next}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(false))
                const sessionsGoNoNext = new ActionRowBuilder()
                    .addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                    .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger))
                    .addComponents(new ButtonBuilder().setCustomId('sessionMove2').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(true))
                    .addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.next}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(true))
                database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, (err, rows) => {
                    if (err) throw err;
                    if (rows.length != 1) {
                        interaction.reply({ components: [sessionsGo], embeds: [embed] });
                    } else {
                        interaction.reply({ components: [sessionsGoNoNext], embeds: [embed] });
                    }
                });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('DarkOrange')
                    .setTitle(`${lang.sessionInfo.noSavedSessions}`)
                    .setDescription(`${lang.sessionInfo.createSessionsUsing}`)
                    .setTimestamp()
                    .setFooter({ text: 'Kod błędu: 4052x' })
                interaction.reply({ embeds: [embed] })
            }
        });
    }
};