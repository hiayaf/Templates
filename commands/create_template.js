const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const util = require('util');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_template')
        .setNameLocalizations({
            pl: 'stwórz_szablon',
            fr: 'creer_modele',
            de: 'erstelle_vorlage'
        })
        .setDescription('Modify server')
        .setDescriptionLocalizations({
            pl: 'Modyfikuj wygląd serwera',
            fr: 'Modifier le serveur',
            de: 'Server anpassen'
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
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
                };
            } else {
                if (fs.existsSync(translationPath)) {
                    lang = require(translationPath);
                } else {
                    lang = require(defaultTranslationPath);
                };
            }
        } catch (error) {
            interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
        };
        if (interaction.channel.type == ChannelType.GuildText) {
            function createSession() {
                const { v4: sessionUuid } = require('uuid');
                const uuid = sessionUuid();
                database.query(`INSERT INTO guild_template(user, locale, uuid) VALUES ('${interaction.user.id}','${interaction.locale}','${uuid}')`)
                return uuid;
            };
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    const copy = new EmbedBuilder()
                        .setTitle(`${lang[`create_template`].backupTitle}`).setColor('Orange')
                        .setTimestamp().setFooter({ text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true, format: "png" }) }).setDescription(`${lang[`create_template`].backupDescription.replace('%s', rows[0].uuid)}`).setTimestamp();
                    const row = new ActionRowBuilder()
                        .addComponents(new ButtonBuilder().setCustomId('save').setLabel(`${lang[`create_template`].saveButton}`).setStyle(ButtonStyle.Success).setEmoji('🧩'))
                        .addComponents(new ButtonBuilder().setCustomId('del').setLabel(`${lang[`create_template`].deleteButton}`).setStyle(ButtonStyle.Danger).setEmoji('💢'));
                    interaction.reply({ embeds: [copy], components: [row], ephemeral: true });
                } else {
                    createSession();
                    const embed = new EmbedBuilder().setColor('#008033').setTitle(`${lang[`create_template`].title}`).setDescription(`${lang[`create_template`].description}`).setTimestamp()
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder().setCustomId('ModifyGuild').setPlaceholder(`${lang.step} 1`).setMaxValues(1).setDisabled(false)
                                .addOptions(
                                    { label: lang[`create_template`].GuildTypeFriends, value: 'GuildTypeFriends', emoji: { name: 'axe', id: '1055628130594852874' } },
                                    { label: lang[`create_template`].GuildTypeSocial, value: 'GuildTypeSocial', emoji: { name: 'rose', id: '1055625903629140088' } },
                                    { label: lang[`create_template`].GuildTypeGame, value: 'GuildTypeGame', emoji: { name: 'UnrealEngine', id: '1055620361653342348' } }
                                ),
                        );
                    const channel = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('channelSelect').setLabel(lang[`create_template`].channelOptions).setStyle(ButtonStyle.Success).setDisabled(true));
                    interaction.reply({ components: [row, channel], embeds: [embed] });
                };
            });
        } else return interaction.reply({ content: `${lang[`create_template`].onlyOnChannel}`, ephemeral: true });
    }
};