
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const fs = require('node:fs');
const path = require('path');
const util = require('util');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('import_settings')
        .setNameLocalizations({
            pl: 'importuj_ustawienia',
            fr: 'importer_paramètres',
            de: 'einstellungen_importieren'
        })
        .setDescription('Import server settings from a JSON file')
        .setDescriptionLocalizations({
            pl: 'Importuj ustawienia serwera z pliku JSON',
            fr: 'Importer les paramètres du serveur à partir d\'un fichier JSON',
            de: 'Importiere Servereinstellungen aus einer JSON-Datei'
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addAttachmentOption((option) =>
            option.setName('file')
                .setNameLocalizations({ pl: 'plik' })
                .setNameLocalizations({ fr: 'fichier' })
                .setNameLocalizations({ de: 'datei' })
                .setDescription('The JSON file to import')
                .setDescriptionLocalizations({
                    pl: 'Plik JSON do zaimportowania',
                    fr: 'Le fichier JSON à importer',
                    de: 'Die zu importierende JSON-Datei'
                })
                .setRequired(true)),
    async execute(interaction) {
        const database = require('../index').database;
        const langCode = interaction.locale.slice(0, 2);
        const translationPath = path.resolve(__dirname, `../translations/${langCode}.json`);
        const defaultTranslationPath = path.resolve(__dirname, '../translations/default.json');
        let lang;
        const queryPromise = util.promisify(database.query).bind(database);
        try {
            const rows = await queryPromise(`SELECT * FROM lang WHERE user = '${interaction.user.id}'`);
            if (rows.length) {
                const userLangCode = rows[0].language;
                const userTranslationPath = path.resolve(__dirname, `../translations/${userLangCode}.json`);
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
        };
        const file = interaction.options.getAttachment('file');
        if (!file.name.endsWith('.json')) {
            return interaction.reply({ content: `${lang[`import_cmd`].notAllowedFileFormat}`, ephemeral: true });
        };
        try {
            const response = await axios.get(file.url);
            if (response.status !== 200) {
                return interaction.reply({
                    content: `${lang[`import_cmd`].downloadingFileError}`, ephemeral: true
                });
            };
            const text = response.data;
            const embed = new EmbedBuilder()
                .setTitle(`${lang[`import_cmd`].importingSettings} ${file.name}`)
                .setFooter({ text: `${lang[`import_cmd`].betaInfo}` })
                .setColor('#008033');
            try {
                const obj = (text);
                let autoSaveVersionValue = null; guildTypeValue = null; channelsValue = null; categoryValue = null; channelParam = null; channelfontValue = null; categoryfontValue = null;
                if (!obj.Settings || !obj.File) {
                    var attachment = `./GuildTemplate.json`;
                    const buffer = fs.readFileSync(attachment);
                    const fileContent = buffer.toString();
                    const embed = new EmbedBuilder()
                        .setTitle(`${lang[`import_cmd`].fileNotSuitable}`)
                        .setDescription(`**${lang[`import_cmd`].sampleTemplate}**\n\`\`\`json\n${fileContent}\`\`\``);
                    await interaction.reply({ embeds: [embed], ephemeral: true, files: [attachment] });
                } else {
                    if (obj.File.autoSaveVersion !== undefined) {
                        const value = obj.File.autoSaveVersion;
                        autoSaveVersionValue = Number.isInteger(value) ? '☑️' : '❌';
                        embed.addFields({ name: `${lang[`import_cmd`].emojisDesc}`, value: `**☑️ - ${lang[`import_cmd`].successOnImport}\n❌ - ${lang[`import_cmd`].errorOnImport}**` });
                        embed.addFields({ name: `${lang[`import_cmd`].autoSaveVer}`, value: `\`\`\`json\nautoSaveVersion: ${value} ${autoSaveVersionValue}\`\`\`` });
                    };
                    if (obj.Settings.guildType !== undefined) {
                        const value = obj.Settings.guildType;
                        guildTypeValue = ['GuildTypeSocial', 'GuildTypeFriends', 'GuildTypeGame'].includes(value) ? '☑️' : '❌';
                        embed.addFields({ name: `${lang[`import_cmd`].templateType}`, value: `\`\`\`json\n${value} ${guildTypeValue}\`\`\`` });
                    };
                    if (obj.Settings.categoryParam !== undefined) {
                        const value = obj.Settings.categoryParam;
                        categoryValue = '☑️';
                        embed.addFields({ name: `${lang[`import_cmd`].categoryParams}`, value: `\`\`\`json\n${value} ${categoryValue}\`\`\`` });
                    };
                    if (obj.Settings.Channel.array !== undefined) {
                        const value = obj.Settings.Channel.array.slice(0, 30).trim().replace(/,$/, '.') + '...';
                        channelsValue = '☑️';
                        embed.addFields({ name: `${lang[`import_cmd`].channelsArray}`, value: `\`\`\`json\n${value} | Force: ${obj.Settings.Channel.force} ${channelsValue}\`\`\`` });
                    };
                    if (obj.Settings.channelParam !== undefined) {
                        const value = obj.Settings.channelParam.slice(0, 25).trim().replace(/,$/, '.') + '';
                        channelParam = '☑️';
                        embed.addFields({ name: `${lang[`import_cmd`].channelParam}`, value: `\`\`\`json\n${value} ${channelParam}\`\`\`` });
                    };
                    if (obj.Settings.channelfont !== undefined) {
                        const value = obj.Settings.channelfont.slice(0, 25).trim().replace(/,$/, '.') + '';
                        channelfontValue = '☑️';
                        embed.addFields({ name: `${lang[`import_cmd`].channelFont}`, value: `\`\`\`json\n${value} ${channelfontValue}\`\`\`` });
                    };
                    if (obj.Settings.categoryfont !== undefined) {
                        const value = obj.Settings.categoryfont.slice(0, 25).trim().replace(/,$/, '.') + '';
                        categoryfontValue = '☑️';
                        embed.addFields({ name: `${lang[`import_cmd`].categoryFont}`, value: `\`\`\`json\n${value} ${categoryValue}\`\`\`` });
                    };
                    const row = new ActionRowBuilder()
                        .addComponents(new ButtonBuilder().setCustomId('loadingx123').setLabel(`${lang.loading}.`).setStyle(ButtonStyle.Primary).setEmoji('🔄').setDisabled(true));
                    await interaction.reply({ embeds: [embed], components: [row] });
                    const updateButton = async (label, style, delay, disabled, emoji, id) => {
                        setTimeout(() => {
                            const newButton = new ButtonBuilder()
                                .setCustomId(id)
                                .setLabel(label)
                                .setStyle(style)
                                .setEmoji(emoji)
                                .setDisabled(disabled);
                            interaction.editReply({ components: [new ActionRowBuilder().addComponents(newButton)] });
                        }, delay);
                    };
                    if (
                        autoSaveVersionValue && autoSaveVersionValue.includes('❌') ||
                        guildTypeValue && guildTypeValue.includes('❌') ||
                        channelsValue && channelsValue.includes('❌') ||
                        categoryValue && categoryValue.includes('❌') ||
                        channelParam && channelParam.includes('❌') ||
                        channelfontValue && channelfontValue.includes('❌') ||
                        categoryfontValue && categoryfontValue.includes('❌')
                    ) {
                        return updateButton(`${lang[`import_cmd`].fileNotSuitable}.`, ButtonStyle.Secondary, 1000, true, "🔄", 'operation');
                    };
                    updateButton(`${lang.load}`, ButtonStyle.Secondary, 500, true, "<:update_discord:1006609775485792396>", 'operation');
                    database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                        if (err) return interaction.editReply({ content: `${lang.servicesError}`, ephemeral: true });
                        if (rows.length) {
                            updateButton(`${lang[`import_cmd`].deleteSessions}`, ButtonStyle.Success, 12000, false, "<:update_discord:1006609775485792396>", 'deletesessions');
                        } else {
                            function createSession() {
                                const { v4: uuidv4 } = require('uuid');
                                const uuid = uuidv4();
                                const channels = obj.Settings.Channel.array.replaceAll(' ', '');
                                if (obj.Settings.Channel.force == true) {
                                    var array = String(channels).split(",");
                                    array.push("force");
                                };
                                if (obj.Settings.Channel.all == true) {
                                    var array = [];
                                    array.push("all");
                                };
                                database.query(`INSERT INTO guild_template(user, guildtype, locale, uuid, channelparam, categorystyle, channels, font, categoryfont) VALUES ('${interaction.user.id}','${obj.Settings.guildType}','${obj.Settings.locale}','${uuid}','${obj.Settings.channelParam}','${obj.Settings.categoryParam}','${array}','${obj.Settings.channelfont}','${obj.Settings.categoryfont}')`);
                                return uuid, array;
                            };
                            createSession();
                            updateButton(`${lang.load}`, ButtonStyle.Success, 1000, false, "<:update_discord:1006609775485792396>", 'continue');
                        };
                    });
                };
            } catch (error) {
                if (error instanceof SyntaxError) {
                    const errorMessage = `${error.name}: ${error.message}`;
                    embed.addFields({ name: `${file.name} ${lang[`import_cmd`].syntaxErrors}`, value: `\`\`\`diff\n${errorMessage}\`\`\`` });
                    hasError = true;
                };
            };
        } catch (error) {
            console.error(error);
            interaction.reply({ content: `${lang[`import_cmd`].downloadingFileError}`, ephemeral: true });
        };
    }
};