const config = require('../../config.json');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonStyle, ButtonBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const util = require('util');
module.exports = async (client, interaction) => {
    const database = require('../../index').database;
    const fonts = require('../../fonts.json');
    const fontedText = require('../../index').fontedText;
    const langCode = interaction.locale.slice(0, 2);
    const translationPath = path.resolve(__dirname, `../../translations/${langCode}.json`);
    const defaultTranslationPath = path.resolve(__dirname, '../../translations/default.json');

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
        console.log(error);
    }
    var PastebinAPI = require('pastebin-js'),
        pastebin = new PastebinAPI({
            'api_dev_key': config.pastebin.key,
            'api_user_name': config.pastebin.username,
            'api_user_password': config.pastebin.password
        });
    const map = require('../client/ready').api;
    //Command
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
    async function validate(embed, interaction) {
        try {
            if (!embed) return;
            if (embed.timestamp) {
                const timestamp = Math.floor(new Date(embed.timestamp).getTime() / 1000);
                const check = Math.floor(Date.now() / 1000) - timestamp;
                if (check > 500) {
                    //const components = interaction.message.components;

                    // if (components) {
                    //     const allComponents = components.map(row => row.components).flat();
                    //     const row = new ActionRowBuilder(allComponents);

                    //     for (let index = 0; index < allComponents.length; index++) {
                    //         row.data[index].disabled = false;
                    //     }
                    // }
                    await interaction.reply({ content: 'Dane tej sesji wygasły, spróbuj stworzyć nową.', ephemeral: true });
                    throw new Error("Session Validate");
                };
            }
        } catch (error) {
            // Obsługa błędu
        }
    }

    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            const value = map.get('api');
            if (value == true) {
                interaction.reply({ content: 'Moduł serwisowy został aktywowany. Spróbuj ponownie później', ephemeral: true });
            } else {
                command.execute(interaction);
            }

        } catch (error) {
            if (error) console.error(error);
            await interaction.reply({ content: 'Podczas wczytywania tej komendy wystąpił błąd', ephemeral: true });
        };
        //ContextMenuCommand
    } else if (interaction.isUserContextMenuCommand()) {
        const { commands } = client;
        const { commandName } = interaction;
        const contextCommand = commands.get(commandName);
        if (!contextCommand) return;
        try {
            await contextCommand.execute(interaction, client);
        } catch (error) {
            console.error(error);
        }
        //SelectMenuInteraction
    } else if (interaction.isStringSelectMenu()) {
        validate(interaction.message.embeds[0], interaction);
        if (interaction.customId == "ModifyGuild") {
            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ModifyGuild2')
                        .setPlaceholder(`${lang.step} 2`)
                        .setDisabled(true)
                        .addOptions({ label: 'Serwer dla moich znajomych', value: 'GuildTypeFriends' })
                );
            const channel = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('channelSelect').setLabel(`${lang.create_template.channelOptions}`).setStyle(ButtonStyle.Success));
            const embed2 = new EmbedBuilder()
                .setColor('#008033')
                .setTitle(`${lang.create_template.title} (${lang.step} 2)`)
                .setDescription(`**${lang.create_template.description}**`);
            database.query(`UPDATE guild_template SET guildtype='${interaction.values[0]}' WHERE user='${interaction.user.id}'`);
            interaction.update({ emeds: [embed2], components: [row, channel] });
        } else if (interaction.customId == "ChannelsSelectBox") {
            const selected = interaction.values;
            const channels = {
                "autoRolesChannel": `<:role:1066389840519778425> **${lang.channelList.autoRolesChannel}**`,
                "filmChannel": `<:Netflix:1066389089168937020> **${lang.channelList.filmChannel}**`,
                "verifyChannel": `<:auth:1066388114366541884> **${lang.channelList.verifyChannel}**`,
                "gamesChannel": `<:amongsus:1066387676602834964> **${lang.channelList.gamesChannel}**`,
                "ticketChannel": `<:ticket:1101301354061897758> **${lang.channelList.ticketChannel}**`,
                "boostChannel": `<a:nitro:1066340230589849723> **${lang.channelList.boostChannel}**`,
                "technoChannel": `<:tech:1066389015852494969> **${lang.channelList.technoChannel}**`,
                "faqChannel": `<:faq:1101300087835078686> **${lang.channelList.faqChannel}**`,
                "memesChannel": `<:memes:1101454127780859958> **${lang.channelList.memesChannel}**`,
                "cmdChannel": `<:cmd:1066350684187938826> **${lang.channelList.cmdChannel}**`,
                "logsChannel": `<:logs:1066384694884712469> **${lang.channelList.logsChannel}**`,
                "adminChannel": `<:admin:1066384965828350072> **${lang.channelList.adminChannel}**`,
                "suggestionChannel": `<:suggestion:1101299368717467700> **${lang.channelList.suggestionChannel}**`,
                "graphicChannel": `<:palette:1066403628715360358> **${lang.channelList.graphicChannel}**`,
                "changelogChannel": `<:changelog:1101300096039145562> **${lang.channelList.changelogChannel}**`,
                "giveawayChannel": `<a:giveaway:1066409829159161896> **${lang.channelList.giveawayChannel}**`,
                "pollChannel": `<:poll:1101300536654954657> **${lang.channelList.pollChannel}**`,
                "eventChannel": `<:events:1066418219625218069> **${lang.channelList.eventChannel}**`,
                "infoChannel": `<:info:1101301728747458571> **${lang.channelList.infoChannel}**`,
                "codeChannel": `<:code:1066420455902302208> **${lang.channelList.codeChannel}**`,
                "offtopChannel": `<:offtop:1101299491434414162> **${lang.channelList.offtopChannel}**`,
                "socialChannel": `<:socials:1101300772102209576> **${lang.channelList.socialChannel}**`,
                "helpChannel": `<:help:1101301889812934726> **${lang.channelList.helpChannel}**`,
                "gamersChannel": `<a:xbox:1066436330382438440> **${lang.channelList.gamersChannel}**`,
                "modelsChannel": `<:blender:1066440481950674974> **${lang.channelList.modelsChannel}**`,
                "bookChannel": `<:wattpad:1066441771636236329> **${lang.channelList.bookChannel}**`,
                "sportChannel": `<:football:1066442419677184121> **${lang.channelList.sportChannel}**`,
            };
            const embed = new EmbedBuilder()
                .setTitle(`${lang.channelList.selectedChannelsToCreate} (${lang.channelList.together} ${selected.length})`).setDescription(`**+** ${selected.length ? selected.map(channel => channels[channel]).join(', \n**+** ') : `${lang.lack}`}`).setTimestamp().setColor('Blurple').setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, format: "png" }) });
            const continueButton = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('continue2').setLabel(`${lang.next}`).setStyle(ButtonStyle.Success))
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                database.query(`UPDATE guild_template SET channels="${selected.toString()}" WHERE user = '${interaction.user.id}'`);
            });
            const row = interaction.message.components[0];
            await interaction.update({ embeds: [interaction.message.embeds[0].data, embed], components: [row, continueButton] });
        } else if (interaction.customId == "ChannelFont") {
            validate(interaction.message.embeds[0], interaction);
            var font = fonts[`${interaction.values[0]}`];
            const embed = new EmbedBuilder().setTitle(`${lang.finalization_embed.selectedFontApplyOnText}`).setColor('Green');
            const row = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('continue3').setLabel(`${lang.next}`).setStyle(ButtonStyle.Success));
            embed.setDescription(`- ` + fontedText(font, interaction.values[0]));
            database.query(`UPDATE guild_template SET font='${interaction.values[0]}' WHERE user=${interaction.user.id}`);
            interaction.update({ embeds: [embed], components: [interaction.message.components[0], row] });
        } else if (interaction.customId == "CategoryFont") {
            validate(interaction.message.embeds[0], interaction);
            var font = fonts[`${interaction.values[0]}`];
            const embed = new EmbedBuilder().setTitle(`${lang.finalization_embed.selectedFontApplyOnCategory}`).setColor('Green');
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('banchannel').setLabel(`${lang.next}`).setStyle(ButtonStyle.Success));
            embed.setDescription(`- ` + fontedText(font, interaction.values[0]));
            database.query(`UPDATE guild_template SET categoryfont='${interaction.values[0]}' WHERE user=${interaction.user.id}`);
            interaction.update({ embeds: [embed], components: [interaction.message.components[0], row] });
        } else if (interaction.customId.startsWith('bannedChannels_')) {
            validate(interaction.message.embeds[0], interaction);
            function getChannels() {
                return new Promise((resolve, reject) => {
                    database.query(`SELECT bndchannels FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) {
                        if (err) {
                            reject(err);
                        } else {
                            if (rows.length) {
                                resolve(rows[0].bndchannels);
                            } else {
                                resolve(null);
                            }
                        }
                    });
                });
            }
            (async () => {
                const channelIds = [];

                interaction.values.forEach(async (channelName) => {
                    const channel = interaction.guild.channels.cache.find((ch) => ch.name === channelName);
                    if (channel && !channelIds.includes(channel.id)) {
                        console.log(channel.id);
                        channelIds.push(channel.id);
                    };
                });

                const bannedChannels = await getChannels();
                interaction.deferUpdate();
                if (bannedChannels !== null) {
                    const existingChannelIds = bannedChannels.split(',');
                    const newChannelIds = channelIds.filter((id) => !existingChannelIds.includes(id));
                    const updatedChannels = existingChannelIds.concat(newChannelIds).join(',');

                    const embed = interaction.message.embeds[0];
                    const selectedChannels = newChannelIds.map((id) => `${interaction.guild.channels.cache.get(id).name} (${id})`).join('\n');

                    let newValue = embed.fields[0].value;
                    if (selectedChannels !== '') {
                        let separator = '';
                        if (newValue.endsWith('```\n')) {
                            newValue = newValue.slice(0, -3);
                            separator = '\n';
                        }
                        newValue += `\`\`\`${separator}${selectedChannels}\n\`\`\``;
                    }

                    database.query(`UPDATE guild_template SET bndchannels='${updatedChannels}' WHERE user=${interaction.user.id}`);
                    embed.fields[0].value = newValue;
                    interaction.message.edit({ embeds: [embed] });
                } else {
                    const updatedChannels = channelIds.join(',');

                    const embed = interaction.message.embeds[0];
                    const selectedChannels = channelIds.map((id) => `${interaction.guild.channels.cache.get(id).name} (${id})`).join('\n');

                    let newValue = embed.fields[0].value;
                    if (selectedChannels !== '') {
                        let separator = '';
                        if (newValue.endsWith('```\n')) {
                            newValue = newValue.slice(0, -3);
                            separator = '\n';
                        }
                        newValue += `\`\`\`${separator}${selectedChannels}\n\`\`\``;
                    };
                    database.query(`UPDATE guild_template SET bndchannels='${updatedChannels}' WHERE user=${interaction.user.id}`);
                    embed.fields[0].value = newValue;
                    interaction.message.edit({ embeds: [embed] });
                };
            })();
        }
        //ButtonInteraction
    } else if (interaction.isButton()) {
        if (interaction.customId == "del") {
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                const saveRows = rows
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (!rows.length) {
                    const embed = new EmbedBuilder().setTitle(`${lang.sessionInfo.noDatToDelete}`).setColor('LuminousVividPink');
                    interaction.update({ components: [], embeds: [embed], ephemeral: true });
                } else {
                    database.query(`DELETE FROM guild_template WHERE user = '${interaction.user.id}'`);
                    const embed = new EmbedBuilder()
                        .setTitle(`${lang.sessionInfo.sessionDeleteSuccess}`)
                        .setFooter({ text: `${saveRows[0].uuid}` })
                        .setDescription(`**${lang.sessionInfo.createNewUsing} </create_discord_template:1105807884312383558>**`)
                        .setColor('#e62929');
                    interaction.update({ components: [], embeds: [embed], ephemeral: true });
                };
            });
        } else if (interaction.customId == "save") {
            validate(interaction.message.embeds[0], interaction);
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    const embed = new EmbedBuilder()
                        .setTitle(`${lang.sessionInfo.databaseConfiguration}`)
                        .setColor('#008033')
                        .setDescription(`**${lang.sessionInfo.backToSession} \`${rows[0].uuid}\`**`);
                    const edit = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('editBackupSession').setLabel(`${lang.edit}`).setStyle(ButtonStyle.Success).setEmoji('🧩'));
                    interaction.update({ embeds: [embed], components: [edit] });
                };
            });
        } else if (interaction.customId == "channelSelect") {
            validate(interaction.message.embeds[0], interaction);
            const modal = new ModalBuilder()
                .setCustomId('channelStyle')
                .setTitle(`${lang.modals.channelStyle.title}`);
            const ChannelStyleInput = new TextInputBuilder()
                .setCustomId('ChannelStyle')
                .setLabel(`${lang.modals.channelStyle.channelStyleInput}`)
                .setMaxLength(4)
                .setMinLength(1)
                .setRequired(true)
                .setPlaceholder('「💻」')
                .setValue('「💻」')
                .setStyle(TextInputStyle.Short);
            const CategoryChannelStyleInput = new TextInputBuilder()
                .setCustomId('CategoryStyle')
                .setLabel(`${lang.modals.channelStyle.categoryStyleInput}`)
                .setRequired(true)
                .setPlaceholder(`${lang.modals.channelStyle.placeholderCategory}`)
                .setMinLength(3)
                .setMaxLength(40)
                .setStyle(TextInputStyle.Paragraph);
            // const DescInput = new TextInputBuilder()
            //     .setCustomId('Description')
            //     .setLabel(`${lang.modals.channelStyle.serverDesc}`)
            //     .setRequired(true)
            //     .setMaxLength(120)
            //     .setStyle(TextInputStyle.Paragraph);
            const ChannelStyle = new ActionRowBuilder().addComponents(ChannelStyleInput);
            const CategoryChannelStyle = new ActionRowBuilder().addComponents(CategoryChannelStyleInput);
            //const DescStyle = new ActionRowBuilder().addComponents(DescInput);
            modal.addComponents(ChannelStyle, CategoryChannelStyle);
            await interaction.showModal(modal);
        } else if (interaction.customId == "continue") {
            validate(interaction.message.embeds[0], interaction);
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                async function check() {
                    const embed = new EmbedBuilder()
                        .setTitle(`${lang.finalization_embed.confirmOperationTitle}`)
                        .setDescription(`**${lang.finalization_embed.confirmOperation}**`)
                        .setColor('DarkRed')
                        .setTimestamp();
                    const buttons = new ActionRowBuilder()
                        .addComponents(new ButtonBuilder().setCustomId('confirm').setLabel(`${lang.continue}`).setStyle(ButtonStyle.Success));
                    if (interaction.message.embeds[1]) {
                        await interaction.update({ embeds: [embed], components: [buttons] });
                    } else return await interaction.update({ embeds: [embed], components: [buttons] });
                };
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (!rows.length) {
                    const embed = new EmbedBuilder().setTitle(`${lang.finalization_embed.noData}`).setColor('LuminousVividPink');
                    interaction.update({ components: [], embeds: [embed], ephemeral: true });
                } else return check();
            })

        } else if (interaction.customId == "confirm") {
            validate(interaction.message.embeds[0], interaction);

            function getUuid() {
                return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) { return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); } else { if (rows.length) { resolve(rows[0].uuid) } else { return interaction.reply({ content: `${lang.sessionInfo.notExist}`, ephemeral: true }); } } }) });
            };
            function getGuildType() {
                return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].guildtype) }) });
            };
            function getFontType() {
                return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].font) }) });
            };
            function getCategoryFontType() {
                return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].categoryfont) }) });
            };
            function getChannelParameter() {
                return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].channelparam) }) });
            };
            function getChannelArray() {
                return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].channels) }) });
            };
            const uuid = await getUuid();
            function checkSessionIfNotExists() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND uuid = '${uuid}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows.length) }) });
            };
            const guildType = await getGuildType();
            const fontType = await getFontType();
            const categoryfontType = await getCategoryFontType();
            const channelparam = await getChannelParameter();
            const channelsarray = await getChannelArray();
            const emojiUrl = guildTypes.find(type => type.name === guildType)?.emoji;
            if (!uuid || !guildType || !fontType || !categoryfontType || !channelparam || !channelparam) return interaction.reply({ content: `${lang.sessionInfo.dataNotComplete}`, ephemeral: true });
            const finalization = new EmbedBuilder()
                .setTitle(`${lang.finalization_embed.finalization}`)
                .addFields(
                    { name: `${lang.finalization_embed.sessionUuid}`, value: `\`\`\`${uuid}\`\`\`` },
                    { name: `${lang.finalization_embed.guildType}`, value: `\`\`\`${guildType}\`\`\`` },
                    { name: `${lang.finalization_embed.fontType}`, value: `\`\`\`${fontType}\`\`\`` },
                    { name: `${lang.finalization_embed.categoryfontType}`, value: `\`\`\`${categoryfontType}\`\`\`` },
                    { name: `${lang.finalization_embed.channelParam}`, value: `\`\`\`${channelparam}\`\`\`` },
                    { name: `${lang.finalization_embed.channelArray}`, value: `\`\`\`${channelsarray.slice(0, 30).trim().replace(/,$/, '.') + '...'}\`\`\`` }
                )
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.guild.iconURL({ dynamic: true, size: 4096 }) })
                .setAuthor({ name: guildType, iconURL: emojiUrl });
            const row = new ActionRowBuilder()
                .addComponents(new StringSelectMenuBuilder().setCustomId('ChannelsSelectBox').setPlaceholder(`${lang.step} 7`).setDisabled(true).addOptions({ value: `test`, label: `test` }));
            const buttons = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('run').setLabel(`${lang.loadTemplate}`).setStyle(ButtonStyle.Success));
            if (await checkSessionIfNotExists() != 1) {
                buttons.addComponents(new ButtonBuilder().setCustomId('saveSession').setLabel(`${lang.saveTemplate}`).setStyle(ButtonStyle.Secondary));
            }
            await interaction.update({ embeds: [finalization], components: [row, buttons] });
        } else if (interaction.customId == "continue2") {
            validate(interaction.message.embeds[0], interaction);
            const row = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('ChannelFont').setPlaceholder(`${lang.step} 4`));
            const embed = new EmbedBuilder().setColor('Blurple').setTitle(`${lang.fontOptions.channelApplyTitle}`).setDescription(`- ` + fontedText(fonts.Default, `${lang.fontOptions.notSelected}`));
            Object.keys(fonts).forEach(function (key) {
                const text = JSON.stringify(fonts[key])
                const obj = JSON.parse(text);
                row.components[0].addOptions(
                    {
                        value: key,
                        label: key,
                        description: `${obj.a + obj.b + obj.c + obj.d + obj.e + obj.f + obj.g + obj.h + obj.i + obj.j + obj.k + obj.l + obj.m + obj.n + obj.o + obj.p + obj.q + obj.r + obj.s + obj.t + obj.u + obj.v + obj.w + obj.x + obj.y + obj.z}`
                    }
                );
            });
            interaction.update({ components: [row], embeds: [embed] })
        } else if (interaction.customId == "saveSession") {
            validate(interaction.message.embeds[0], interaction);
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    const saveRows = rows;
                    database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, (err, rows) => {
                        if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                        if (rows.length >= 5) {
                            interaction.reply({ content: `${lang.sessionInfo.limitExceeded} </saved-sessions:1082756745476190328>`, ephemeral: true });
                        } else {
                            database.query(`INSERT INTO saved_sessions(user, guildtype, locale, uuid, channelparam, categorystyle, channels, font, categoryfont, session) SELECT '${saveRows[0].user}', '${saveRows[0].guildtype}', '${saveRows[0].locale}', '${saveRows[0].uuid}', '${saveRows[0].channelparam}', '${saveRows[0].categorystyle}', '${saveRows[0].channels}', '${saveRows[0].font}', '${saveRows[0].categoryfont}', IFNULL(MAX(session) + 1, 1) FROM saved_sessions WHERE user = '${saveRows[0].user}'`);
                            const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('run').setLabel('Wczytaj szablon').setStyle(ButtonStyle.Success));
                            interaction.message.edit({ components: [button] });
                            interaction.reply({ content: `${lang.sessionInfo.successfulSaveInfo} ${saveRows[0].uuid}`, ephemeral: true });
                        };
                    });
                } else return interaction.reply({ content: `${lang.sessionInfo.notExistOrSaved}`, ephemeral: true });
            });
        } else if (interaction.customId == "sessionLoad") {
            validate(interaction.message.embeds[0], interaction);
            var session = interaction.message.embeds[0].data.title;
            var sessionId = parseInt(session.charAt(6));
            database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = ${sessionId}`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    function createSession() {
                        const { v4: uuidv4 } = require('uuid');
                        const uuid = uuidv4();
                        database.query(`INSERT INTO guild_template(user, guildtype, locale, uuid, channelparam, categorystyle, channels, font, categoryfont) VALUES ('${interaction.user.id}','${rows[0].guildtype}','${rows[0].locale}','${uuid}','${rows[0].channelparam}','${rows[0].categorystyle}','${rows[0].channels}','${rows[0].font}','${rows[0].categoryfont}')`)
                        return uuid;
                    };
                    database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                        if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                        if (rows.length) {
                            const session = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('sessionDelete2').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger));
                            const embed = new EmbedBuilder().setColor('Orange').setTitle(`${lang.sessionInfo.workingSessionInfo}`).setTimestamp();
                            interaction.reply({ embeds: [embed], ephemeral: true, components: [session] });
                        } else {
                            createSession();
                            const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('confirm').setLabel(`${lang.continue}`).setStyle(ButtonStyle.Success));
                            const embed = new EmbedBuilder().setColor('#008033').setTitle(`${lang.sessionInfo.dataValidation}`).setTimestamp();
                            interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
                        };
                    });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('DarkOrange')
                        .setTitle(`${lang.sessionInfo.sessionDeleteInfoTitle}`)
                        .setDescription(`**${lang.sessionInfo.createSessionsUsing.replace("%cmd", "</create_discord_template:1055609024420270202>**")}`)
                        .setTimestamp()
                        .setFooter({ text: 'Kod błędu: 4054c' });
                    interaction.editReply({ embeds: [embed], ephemeral: true });
                };
            });
        } else if (interaction.customId == "sessionMove") {
            validate(interaction.message.embeds[0], interaction);
            var session = interaction.message.embeds[0].data.title;
            var Number = parseInt(session.charAt(session.length - 1));
            function getUuid() {
                return new Promise(resolve => {
                    database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}
                '`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].uuid) })
                });
            };
            function getGuildType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].guildtype) }) });
            };
            function getFontType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].font) }) });
            };
            function getCategoryFontType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].categoryfont) }) });
            };
            function getChannelParameter() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].channelparam) }) });
            };
            function getChannelArray() {
                return new Promise(resolve => { database.query((`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`), function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].channels) }) });
            };

            const uuid = await getUuid();
            const guildType = await getGuildType();
            const fontType = await getFontType();
            const categoryfontType = await getCategoryFontType();
            const channelparam = await getChannelParameter();
            const channelsarray = await getChannelArray()

            const emojiUrl = guildTypes.find(type => type.name === guildType)?.emoji;
            function sessionLoad(sessionNumber) {
                database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = ${sessionNumber}`, (err, rows) => {
                    if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                    if (rows.length) {
                        const embed = new EmbedBuilder()
                            .setTitle(`${lang.session} ${sessionNumber}`)
                            .addFields(
                                { name: `${lang.finalization_embed.sessionUuid}`, value: `\`\`\`${uuid}\`\`\`` },
                                { name: `${lang.finalization_embed.guildType}`, value: `\`\`\`${guildType}\`\`\`` },
                                { name: `${lang.finalization_embed.fontType}`, value: `\`\`\`${fontType}\`\`\`` },
                                { name: `${lang.finalization_embed.categoryfontType}`, value: `\`\`\`${categoryfontType}\`\`\`` },
                                { name: `${lang.finalization_embed.channelParam}`, value: `\`\`\`${channelparam}\`\`\`` },
                                { name: `${lang.finalization_embed.channelArray}`, value: `\`\`\`${channelsarray.slice(0, 30).trim().replace(/,$/, '.') + '...'}\`\`\`` }
                            )
                            .setTimestamp()
                            .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.guild.iconURL({ dynamic: true, size: 4096 }) })
                            .setAuthor({ name: guildType, iconURL: emojiUrl })
                        const sessionsGo = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                            .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger))
                            .addComponents(new ButtonBuilder().setCustomId('sessionMove2').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(false))
                        if (sessionNumber == 5) {
                            sessionsGo.addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(true))
                        } else {
                            sessionsGo.addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(false))
                        };
                        const sessionsGoNoNext = new ActionRowBuilder()
                            .addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                            .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger))
                            .addComponents(new ButtonBuilder().setCustomId('sessionMove2').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(false))
                            .addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(true))
                        database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session =${Number}`, (err, rows) => {
                            const saveRows = rows;
                            database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' ORDER BY session ASC`, (err, rows) => {
                                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                                const firstSession = rows[0];
                                const secondSession = rows[1];
                                const nextSession = rows[Number + 1]
                                if (nextSession) {
                                    interaction.update({ components: [sessionsGo], embeds: [embed] });
                                } else {
                                    interaction.update({ components: [sessionsGoNoNext], embeds: [embed] });
                                };
                            });
                        });
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor('DarkOrange')
                            .setTitle(`${lang.sessionInfo.noSavedSessions}`)
                            .setDescription(`**${lang.sessionInfo.createSessionsUsing.replace("%cmd", "</create_discord_template:1055609024420270202>**")}`)
                            .setTimestamp()
                            .setFooter({ text: 'Kod błędu: 4052c' });
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    };
                });
            };
            const nextSession = parseInt(Number) + 1
            sessionLoad(nextSession)
        } else if (interaction.customId == "sessionMove2") {
            validate(interaction.message.embeds[0], interaction);
            var session = interaction.message.embeds[0].data.title;
            var Number = session.charAt(session.length - 1);
            function getUuid() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); if (rows.length) return resolve(rows[0].uuid) }) });
            };
            function getGuildType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].guildtype) }) });
            };
            function getFontType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].font) }) });
            };
            function getCategoryFontType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].categoryfont) }) });
            };
            function getChannelParameter() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].channelparam) }) });
            };
            function getChannelArray() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = '${Number}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].channels) }) });
            };
            const uuid = await getUuid();
            const guildType = await getGuildType();
            const fontType = await getFontType();
            const categoryfontType = await getCategoryFontType();
            const channelparam = await getChannelParameter();
            const channelsarray = await getChannelArray()

            const emojiUrl = guildTypes.find(type => type.name === guildType)?.emoji;
            function sessionLoad(sessionNumber) {
                database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = ${sessionNumber}`, (err, rows) => {
                    if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                    if (rows.length) {
                        const embed = new EmbedBuilder()
                            .setTitle(`${lang.session} ${sessionNumber}`)
                            .addFields(
                                { name: `${lang.finalization_embed.sessionUuid}`, value: `\`\`\`${uuid}\`\`\`` },
                                { name: `${lang.finalization_embed.guildType}`, value: `\`\`\`${guildType}\`\`\`` },
                                { name: `${lang.finalization_embed.fontType}`, value: `\`\`\`${fontType}\`\`\`` },
                                { name: `${lang.finalization_embed.categoryfontType}`, value: `\`\`\`${categoryfontType}\`\`\`` },
                                { name: `${lang.finalization_embed.channelParam}`, value: `\`\`\`${channelparam}\`\`\`` },
                                { name: `${lang.finalization_embed.channelArray}`, value: `\`\`\`${channelsarray.slice(0, 30).trim().replace(/,$/, '.') + '...'}\`\`\`` }
                            )
                            .setTimestamp()
                            .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.guild.iconURL({ dynamic: true, size: 4096 }) })
                            .setAuthor({ name: guildType, iconURL: emojiUrl })
                        const sessionsGo = new ActionRowBuilder()
                            .addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                            .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger))
                        if (sessionNumber == 1) {
                            sessionsGo.addComponents(new ButtonBuilder().setCustomId('sessionMove2').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(true))
                                .addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(false))
                        } else {
                            sessionsGo.addComponents(new ButtonBuilder().setCustomId('sessionMove2').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(false))
                            sessionsGo.addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(false))
                        };
                        const sessionsGoNoNext = new ActionRowBuilder()
                            .addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                            .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger))
                            .addComponents(new ButtonBuilder().setCustomId('sessionMove2').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(true))
                            .addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(true))
                        database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, (err, rows) => {
                            if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                            if (rows.length > 1) {
                                interaction.update({ components: [sessionsGo], embeds: [embed] });
                            } else {
                                interaction.update({ components: [sessionsGoNoNext], embeds: [embed] });
                            };
                        });
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor('DarkOrange')
                            .setTitle(`${lang.sessionInfo.noSavedSessions}`)
                            .setDescription(`**${lang.sessionInfo.createSessionUsing} </create_discord_template:1055609024420270202>**`)
                            .setTimestamp()
                            .setFooter({ text: 'Kod błędu: 4052c' })
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    };
                });
            };
            var nextSession = parseInt(Number) - 1;
            sessionLoad(nextSession);
        } else if (interaction.customId == "sessionDelete") {
            validate(interaction.message.embeds[0], interaction);
            await interaction.deferReply({ ephemeral: true });
            var session = interaction.message.embeds[0].data.title;
            var Number = parseInt(session.charAt(session.length - 1));
            database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = ${Number}`, (err, rows) => {
                const savedRows = rows;
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    database.query(`DELETE FROM saved_sessions WHERE user = '${interaction.user.id}' AND session = ${Number}`, (err, rows) => {
                        if (Number == 1) {
                            database.query(`UPDATE saved_sessions SET session='1' WHERE session ='2' AND user ='${interaction.user.id}'`);
                            database.query(`UPDATE saved_sessions SET session='2' WHERE session ='3' AND user ='${interaction.user.id}'`);
                            database.query(`UPDATE saved_sessions SET session='3' WHERE session ='4' AND user ='${interaction.user.id}'`);
                            database.query(`UPDATE saved_sessions SET session='4' WHERE session ='5' AND user ='${interaction.user.id}'`);
                        } else if (Number == 2) {
                            database.query(`UPDATE saved_sessions SET session='2' WHERE session ='3' AND user ='${interaction.user.id}'`);
                            database.query(`UPDATE saved_sessions SET session='3' WHERE session ='4' AND user ='${interaction.user.id}'`);
                            database.query(`UPDATE saved_sessions SET session='4' WHERE session ='5' AND user ='${interaction.user.id}'`);
                        } else if (Number == 3) {
                            database.query(`UPDATE saved_sessions SET session='3' WHERE session ='4' AND user ='${interaction.user.id}'`);
                            database.query(`UPDATE saved_sessions SET session='4' WHERE session ='5' AND user ='${interaction.user.id}'`);
                        } else if (Number == 4) {
                            database.query(`UPDATE saved_sessions SET session='4' WHERE session ='5' AND user ='${interaction.user.id}'`);
                        }
                        database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND session =${Number}`, (err, rows) => {
                            const saveRows = rows;
                            database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' ORDER BY session ASC`, (err, rows) => {
                                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                                const sessionsGo = new ActionRowBuilder()
                                    .addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                                    .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger));
                                if (Number == 1) {
                                    sessionsGo.addComponents(new ButtonBuilder().setCustomId('sessionMoveBack').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(true))
                                        .addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(false));
                                } else {
                                    sessionsGo.addComponents(new ButtonBuilder().setCustomId('sessionMoveBack').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(false));
                                    sessionsGo.addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(false));
                                }
                                const sessionsGoNoNext = new ActionRowBuilder()
                                    .addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                                    .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger))
                                    .addComponents(new ButtonBuilder().setCustomId('sessionMoveBack').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(false))
                                    .addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(true))
                                const sessionsGoNoNext2 = new ActionRowBuilder()
                                    .addComponents(new ButtonBuilder().setCustomId('sessionLoad').setLabel(`${lang.apply}`).setStyle(ButtonStyle.Success))
                                    .addComponents(new ButtonBuilder().setCustomId('sessionDelete').setLabel(`${lang.delete}`).setStyle(ButtonStyle.Danger))
                                    .addComponents(new ButtonBuilder().setCustomId('sessionMoveBack').setLabel(`${lang.sessionInfo.previousSession}`).setStyle(ButtonStyle.Primary).setEmoji('⬅️').setDisabled(true))
                                    .addComponents(new ButtonBuilder().setCustomId('sessionMove').setLabel(`${lang.sessionInfo.nextSession}`).setStyle(ButtonStyle.Primary).setEmoji('➡️').setDisabled(true));
                                const nextSession = rows[Number + 1]
                                if (nextSession) {
                                    const embed = new EmbedBuilder().setTimestamp().setTitle(`${lang.sessionInfo.sessionDelete}`).setDescription(`**${lang.sessionInfo.sessionDeleteEmbed} ${savedRows[0].uuid}**`)
                                    interaction.message.edit({ components: [sessionsGo] });
                                    interaction.editReply({ embeds: [embed], ephemeral: true });
                                } else if (rows.length == 1) {
                                    const embed = new EmbedBuilder().setTimestamp().setTitle(`${lang.sessionInfo.sessionDelete}`).setDescription(`**${lang.sessionInfo.sessionDeleteEmbed} ${savedRows[0].uuid}**`)
                                    interaction.message.edit({ components: [sessionsGoNoNext2] });
                                    interaction.editReply({ embeds: [embed], ephemeral: true });
                                } else {
                                    const embed = new EmbedBuilder().setTimestamp().setTitle(`${lang.sessionInfo.sessionDelete}`).setDescription(`**${lang.sessionInfo.sessionDeleteEmbed} ${savedRows[0].uuid}**`)
                                    interaction.message.edit({ components: [sessionsGoNoNext] });
                                    interaction.editReply({ embeds: [embed], ephemeral: true });
                                }
                            });
                        })
                    });
                } else {
                    const checkSession = interaction.message.embeds[0].data.title;
                    const session = checkSession.substring(checkSession.indexOf('`') + 1, checkSession.indexOf('`', checkSession.indexOf('`') + 1)).replaceAll('(', '').replaceAll(')', '');
                    database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}' AND uuid = '${session}'`, (err, rows) => {
                        if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                        if (!rows.length) {
                            if (session != '') {
                                const embed = new EmbedBuilder()
                                    .setColor('DarkOrange').setTitle(`${lang.sessionInfo.sessionWithIdDelete.replace("%session", `${session}`)}`).setDescription(`**${lang.sessionInfo.createSessionsUsing.replace("%cmd", "</create_discord_template:1082756745476190321>**")}`).setTimestamp().setFooter({ text: 'Kod błędu: 4013x' })
                                interaction.editReply({ embeds: [embed], ephemeral: true });
                            } else {
                                interaction.message.delete();
                                interaction.reply('Already deleted');
                            }
                        }
                    })
                }
            });
        } else if (interaction.customId == "sessionDelete2") {
            validate(interaction.message.embeds[0], interaction);

            function getUuid() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].uuid) }) });
            };
            function getGuildType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].guildtype) }) });
            };
            function getFontType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].font) }) });
            };
            function getCategoryStyle() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].categorystyle) }) });
            };
            function getCategoryFontType() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].categoryfont) }) });
            };
            function getChannelParameter() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].channelparam) }) });
            };
            function getChannelArray() {
                return new Promise(resolve => { database.query(`SELECT * FROM saved_sessions WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].channels) }) });
            };
            const uuid = await getUuid();
            const guildType = await getGuildType();
            const fontType = await getFontType();
            const categoryfontType = await getCategoryFontType();
            const channelparam = await getChannelParameter();
            const channelsarray = await getChannelArray();
            const categorystyle = await getCategoryStyle();
            database.query(`DELETE FROM guild_template WHERE user='${interaction.user.id}'`);
            database.query(`INSERT INTO guild_template(user, guildtype, locale, uuid, channelparam, categorystyle, channels, font, categoryfont) VALUES ('${interaction.user.id}','${guildType}','${interaction.locale}','${uuid}','${channelparam}','${categorystyle}','${channelsarray}','${fontType}','${categoryfontType}')`);
            const session = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('confirm').setLabel(`${lang.continue}`).setStyle(ButtonStyle.Success));
            interaction.update({ content: `${lang.sessionInfo.activeSessionDelete}`, components: [session] });
        } else if (interaction.customId == "deletesessions") {
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    interaction.deferUpdate();
                    //database.query(`DELETE FROM guild_template WHERE user='${interaction.user.id}'`)
                    const updateButton = async (label, style, delay, disabled, emoji, id) => {
                        setTimeout(() => {
                            const newButton = new ButtonBuilder()
                                .setCustomId(id)
                                .setLabel(label)
                                .setStyle(style)
                                .setEmoji(emoji)
                                .setDisabled(disabled);

                            interaction.message.edit({
                                components: [new ActionRowBuilder().addComponents(newButton)],
                            });
                        }, delay);
                    };
                    updateButton(`${lang.success}`, ButtonStyle.Success, 0, true, "🧩", 'operation');
                    updateButton(`${lang.loading}.`, ButtonStyle.Secondary, 2000, true, "🔄", 'operation');
                    updateButton(`${lang.load}`, ButtonStyle.Success, 4000, false, "<:update_discord:1006609775485792396>", 'continue');
                } else {
                    const updateButton = async (label, style, delay, disabled, emoji, id) => {
                        setTimeout(() => {
                            const newButton = new ButtonBuilder()
                                .setCustomId(id)
                                .setLabel(label)
                                .setStyle(style)
                                .setEmoji(emoji)
                                .setDisabled(disabled);

                            interaction.message.edit({
                                components: [new ActionRowBuilder().addComponents(newButton)],
                            });
                        }, delay);
                    };
                    updateButton(`${lang.loading}.`, ButtonStyle.Secondary, 2000, true, "🔄", 'operation');
                    updateButton(`${lang.load}`, ButtonStyle.Success, 4000, false, "<:update_discord:1006609775485792396>", 'run');
                }
            })
        } else if (interaction.customId == "run") {
            if (interaction.message.embeds[0].footer.text != interaction.user.id) return interaction.reply({ content: `Nie posiadasz uprawnień do uruchomienia generatora tego szablonu ponieważ ktoś już z niego korzysta.`, ephemeral: true })
            validate(interaction.message.embeds[0], interaction);
            let startTime = Date.now();
            const buttons = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('run').setLabel(`${lang.loadTemplate}`).setStyle(ButtonStyle.Success).setDisabled(true))
            interaction.message.edit({ components: [buttons] });
            await interaction.deferReply({ ephemeral: true });
            async function createTemplate(channelparam, CategoryParam, channels) {
                const client = require('../../index').client;
                const channelChannels = client.guilds.cache.get(interaction.guild.id).channels.cache.filter(channel => channel.type === ChannelType.GuildText);
                const channelArray = Array.from(channelChannels.values());

                function getChannels() {
                    return new Promise((resolve, reject) => {
                        database.query(`SELECT bndchannels FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) {
                            if (err) {
                                reject(err);
                            } else {
                                if (rows.length) {
                                    resolve(rows[0].bndchannels);
                                } else {
                                    resolve(null);
                                };
                            };
                        });
                    });
                }
                let dontDelete = await getChannels();
                if (dontDelete == null) dontDelete = [];
                else dontDelete = dontDelete.split(',');

                var ichannel = 0;
                var ichannelnot = 0;
                var icategory = 0;
                var ivoice = 0;
                var iforum = 0;

                function deleteChar(string, int) {
                    var convertedString = string;
                    convertedString = string.substring(0, string.length - int);
                    return convertedString;
                }

                const statEmbed = new EmbedBuilder().setTitle(`${lang.successfullyCreatedTemplate_template}`).setDescription(`\`\`\`${lang.channelParameter}\`\`\``).setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, format: "png" }) }).setColor('#8a1ca6').setTimestamp().setFooter({ text: interaction.user.tag });

                // channelDelete
                while (ichannel !== channelArray.length) {
                    const fetchedChannel = client.channels.cache.get(channelArray[ichannel].id);
                    if (fetchedChannel.deletable && !dontDelete.includes(fetchedChannel.id) && fetchedChannel !== interaction.channel) { // Sprawdzenie, czy kanał jest usuwalny, nie znajduje się na liście "dontDelete" i nie jest to kanał interakcji
                        fetchedChannel.delete();
                    } else {
                        ichannelnot++;
                    }
                    ichannel++;
                }


                // categoryDelete
                const categoryChannels = client.guilds.cache.get(interaction.guild.id).channels.cache.filter(channel => channel.type === ChannelType.GuildCategory);
                const categoriesArray = Array.from(categoryChannels.values());
                try {
                    while (icategory !== categoriesArray.length) {
                        const fetchedChannel = client.channels.cache.get(categoriesArray[icategory].id);
                        fetchedChannel.delete();
                        icategory++;
                    }
                } catch (error) { }

                // voiceDelete
                const voiceChannels = client.guilds.cache.get(interaction.guild.id).channels.cache.filter(channel => channel.type === ChannelType.GuildVoice);
                const voiceArray = Array.from(voiceChannels.values());
                try {
                    while (ivoice !== voiceArray.length) {
                        const fetchedChannel = client.channels.cache.get(voiceArray[ivoice].id);
                        fetchedChannel.delete();
                        ivoice++;
                    }
                } catch (error) { }

                // forumDelete
                const forumChannels = client.guilds.cache.get(interaction.guild.id).channels.cache.filter(channel => channel.type === ChannelType.GuildForum);
                const forumArray = Array.from(forumChannels.values());
                try {
                    while (iforum !== forumArray.length) {
                        const fetchedChannel = client.channels.cache.get(forumArray[iforum].id);
                        fetchedChannel.delete();
                        iforum++;
                    }
                } catch (error) { }

                const embed = new EmbedBuilder().setTitle(`${lang.taskCompleted}`).setColor('#8a1ca6');

                if (ichannel - ichannelnot !== 0) {
                    embed.addFields({ name: `${lang.finalization_embed.textChannelsDeleted}`, value: `\`\`\`${ichannel - ichannelnot}/${channelArray.length - ichannelnot}\`\`\`` });
                }
                if (ivoice !== 0) {
                    embed.addFields({ name: `${lang.finalization_embed.voiceChannelsDeleted}`, value: `\`\`\`${ivoice}/${voiceArray.length}\`\`\`` });
                }
                if (icategory !== 0) {
                    embed.addFields({ name: `${lang.finalization_embed.categoryChannelsDeleted}`, value: `\`\`\`${icategory}/${categoriesArray.length}\`\`\`` });
                }
                if (iforum !== 0) {
                    embed.addFields({ name: `${lang.finalization_embed.forumChannelsDeleted}`, value: `\`\`\`${iforum}/${forumArray.length}\`\`\`` });
                }


                function getGuildType() {
                    return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); if (rows.length) return resolve(rows[0].guildtype) }) });
                };
                function getFontType() {
                    return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].font) }) });
                };
                function getCategoryFontType() {
                    return new Promise(resolve => { database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) { if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true }); resolve(rows[0].categoryfont) }) });
                };
                const guildType = await getGuildType();
                const categoryfont = await getCategoryFontType();
                const CategoryStyle = CategoryParam;
                if (!guildType) return interaction.reply('Błąd 23x');
                var channelStyle = channelparam;
                var style = channelStyle;
                style = style.trim();
                const arr = Array.from(style);
                var preview;
                const withEmojis = /\p{Emoji}/u
                const font = await getFontType();
                if (withEmojis.test(arr[1])) {
                    //if middle char is emoji
                    if (arr[2]) { preview = arr[0] + `{emoji}` + arr[2] } else { preview = arr[0] + `{emoji}` }
                    statEmbed.setDescription(deleteChar(statEmbed.data.description, 3) + ` ${preview}\`\`\``);
                } else if (withEmojis.test(arr[0])) {
                    //if first char is emoji
                    if (arr[1]) { preview = arr[1] }
                    if (arr[2]) { preview = preview + arr[2] }
                    channelStyleShow = `{emoji}` + preview;
                    statEmbed.setDescription(deleteChar(statEmbed.data.description, 3) + ` ${channelStyleShow}\`\`\``);
                } else if (withEmojis.test(arr[2])) {
                    //if third char is emoji
                    if (arr[1]) { preview = arr[0] + arr[1] + `{emoji}` } else { preview = arr[0] + `{emoji}` }
                    statEmbed.setDescription(deleteChar(statEmbed.data.description, 3) + ` ${preview}\`\`\``);
                }
                statEmbed.setDescription(deleteChar(statEmbed.data.description, 3) + `\n${lang.finalization_embed.selectedGuildType} ${guildType}\`\`\``);
                statEmbed.setDescription(deleteChar(statEmbed.data.description, 3) + `\n${lang.finalization_embed.selectedCategoryParam} ${format(`{name}`, "{emoji}")}\`\`\``);
                statEmbed.setDescription(deleteChar(statEmbed.data.description, 3) + `\n${lang.finalization_embed.selectedFont} ${font}\`\`\``);
                statEmbed.setDescription(deleteChar(statEmbed.data.description, 3) + `\n${lang.finalization_embed.selectedFontCategory} ${categoryfont}\`\`\``);
                statEmbed.setDescription(deleteChar(statEmbed.data.description, 3) + `\n\n${lang.finalization_embed.info}\`\`\``);
                function returnChannelObject(param) {
                    const arr = Array.from(param);
                    if (arr.length < 3) {
                        return {
                            style: arr.some((value) => value === undefined) ? "InvalidFormat" : "ValidFormat",
                            emoji: arr[1] !== undefined ? arr[1] : "",
                            string: arr[0] !== undefined ? arr[0] : "",
                            string2: arr[2] !== undefined ? arr[2] : ""
                        };
                    }
                    if (withEmojis.test(arr[1])) {
                        // MidcharIsEmoji
                        return {
                            style: "SecondCharIsEmoji",
                            emoji: arr[1],
                            string: arr[0],
                            string2: arr[2]
                        };
                    } else if (withEmojis.test(arr[0])) {
                        // FirstcharIsEmoji
                        if (arr[1] && arr[2]) {
                            return {
                                style: "FirstCharIsEmoji",
                                emoji: arr[1],
                                string: '',
                                string2: arr[1] + arr[2]
                            };
                        } else if (!arr[2]) {
                            // FirstcharIsEmoji
                            return {
                                style: "FirstCharIsEmoji",
                                emoji: '',
                                string: arr[1],
                                string2: ''
                            };
                        }
                    } else if (withEmojis.test(arr[2])) {
                        // ThirdcharIsEmoji
                        return {
                            style: "ThirdCharIsEmoji",
                            emoji: '',
                            string: arr[0] + arr[1],
                            string2: ''
                        };
                    }

                    return {
                        style: "NoMatch",
                        emoji: '',
                        string: '',
                        string2: ''
                    };
                }

                function format(name, emotka) {
                    const stringWithPlaceholders = ["{name}", "{emoji}"];
                    const replacements = {
                        name: name || '',
                        emoji: emotka || ''
                    };

                    let string = stringWithPlaceholders.join(' ');

                    stringWithPlaceholders.forEach((placeholder) => {
                        const placeholderWithoutDelimiters = placeholder.substring(1, placeholder.length - 1);
                        const stringReplacement = replacements[placeholderWithoutDelimiters] || '';
                        string = string.replace(placeholder, stringReplacement);
                    });

                    return string;
                }
                const object = returnChannelObject(channelparam)
                console.log(object)
                const rulesChannel = client.guilds.cache.get(interaction.guild.id).channels.cache.filter(channel => channel.id === interaction.guild.rulesChannelId).first();

                if (channels) var array = channels.split(",");
                if (array.includes("autoRolesChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🔧` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.autoRolesChannel}`)),
                        type: ChannelType.GuildText,
                        topic: `${lang.guildTemplateCreationParameters.topics.autoRoleChannel}`
                    });
                }
                if (array.includes("verifyChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🧩` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.verifyChannel}`)),
                        type: ChannelType.GuildText,
                        topic: `${lang.guildTemplateCreationParameters.topics.authChannel} ⛳`,
                        permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.CreatePrivateThreads] }]
                    });
                }
                const categoryMain = await interaction.guild.channels.create({
                    name: object.string + `🔔` + object.string2 + fontedText(fonts[`${categoryfont}`], interaction.guild.name),
                    type: ChannelType.GuildCategory,
                });
                const category = await interaction.guild.channels.create({
                    name: object.string + `📋` + object.string2 + fontedText(fonts[`${categoryfont}`], format(`${lang.channelList.textChannels}`)),
                    type: ChannelType.GuildCategory,
                });
                if (rulesChannel) {
                    rulesChannel.setParent(categoryMain)
                    rulesChannel.setName(object.string + `📜` + object.string2 + fontedText(fonts[`${font}`], `zasady`))
                }
                await interaction.guild.channels.create({
                    name: object.string + `👋` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.welcomeChannel}`)),
                    type: ChannelType.GuildText,
                    parent: categoryMain.id,
                    topic: `${lang.guildTemplateCreationParameters.topics.welcomeChannel.replace('%s', interaction.guild.name)}`
                });
                if (array.includes("eventChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🏆` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.eventChannel}`)),
                        type: ChannelType.GuildText,
                        parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.welcomeChannel}`
                    });
                }
                if (array.includes("infoChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `📰` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.infoChannel}`)),
                        type: ChannelType.GuildText,
                        parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.infoChannel}`
                    });
                }
                if (array.includes("changelogChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🔧` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.changelogChannel}`)),
                        type: ChannelType.GuildText,
                        parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.changelogChannel}`
                    });
                }
                if (array.includes("pollChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🍏` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.pollChannel}`)),
                        type: ChannelType.GuildText,
                        parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.pollChannel}`
                    });
                }
                await interaction.guild.channels.create({
                    name: object.string + `💬` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.generalChannel}`)),
                    type: ChannelType.GuildText,
                    parent: category.id,
                    topic: `${lang.guildTemplateCreationParameters.topics.generalChannel}`,
                });
                if (array.includes("memesChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🤪` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.memesChannel}`)),
                        type: ChannelType.GuildText,
                        parent: category.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.memes}`,
                        nsfw: true
                    });
                }
                if (array.includes("boostChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🌹` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.boostChannel}`)),
                        type: ChannelType.GuildText, parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.boostChannel}`
                    });
                }
                if (array.includes("giveawayChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🎀` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.giveawayChannel}`)),
                        type: ChannelType.GuildText, parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.giveawayChannel}`
                    });
                }
                if (array.includes("suggestionChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `✨` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.suggestionChannel}`)),
                        type: ChannelType.GuildText, parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.suggestionChannel}`
                    });
                }
                if (array.includes("helpChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🆘` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.helpChannel}`)),
                        type: ChannelType.GuildText, parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.helpChannel}`
                    });
                }
                if (array.includes("faqChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `📚` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.faqChannel}`)),
                        type: ChannelType.GuildText,
                        parent: categoryMain.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.faqChannel}`
                    });
                }
                if (array.includes("cmdChannel") || array.includes("all") || array.includes("force")) {
                    await interaction.guild.channels.create({
                        name: object.string + `🤖` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.cmdChannel}`)),
                        type: ChannelType.GuildText,
                        parent: category.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.cmdChannel}`
                    });
                }
                //Kategorie
                if (guildType == "GuildTypeGame") {
                    const categoryGame = await interaction.guild.channels.create({
                        name: object.string + `🎮` + object.string2 + fontedText(fonts[`${categoryfont}`], format(`${lang.channelList.gamesChannel}`)),
                        type: ChannelType.GuildCategory,
                    });
                    if (array.includes("gamesChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `👥` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.gamesChannel}`)),
                            type: ChannelType.GuildText, parent: categoryGame.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.gamesChannel}`
                        });
                    }
                    if (array.includes("gamersChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `🎮` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.gamesChannel}`)),
                            type: ChannelType.GuildText, parent: categoryGame.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.gamersChannel}`
                        });
                    }
                    if (array.includes("graphicChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `🎨` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.graphicChannel}`)),
                            type: ChannelType.GuildText, parent: categoryGame.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.graphicChannel}`
                        });
                    }
                    if (array.includes("technoChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `💻` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.technoChannel}`)),
                            type: ChannelType.GuildText, parent: categoryGame.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.technoChannel}`
                        });
                    }
                    if (array.includes("modelsChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `🚀` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.modelsChannel}`)),
                            type: ChannelType.GuildText, parent: categoryGame.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.modelsChannel}`
                        });
                    }
                    if (array.includes("codeChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `👨` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.codeChannel}`)),
                            type: ChannelType.GuildText, parent: categoryGame.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.codeChannel}`
                        });
                    }
                } else if (guildType == "GuildTypeSocial") {
                    if (array.includes("socialChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `📷` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.socialChannel}`)),
                            type: ChannelType.GuildText, parent: categoryMain.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.socialChannel}`
                        });
                    }
                    if (array.includes("bookChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `📚` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.bookChannel}`)),
                            type: ChannelType.GuildText,
                            parent: category.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.bookChannel}`
                        });
                    }
                    if (array.includes("offtopChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `🌴` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.offtopChannel}`)),
                            type: ChannelType.GuildText,
                            parent: category.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.offtopChannel}`
                        });
                    }
                    if (array.includes("filmChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `🎬` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.filmChannel}`)),
                            type: ChannelType.GuildText,
                            parent: category.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.filmChannel}`
                        });
                    }
                    if (array.includes("sportChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `🏅` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.sportChannel}`)),
                            type: ChannelType.GuildText,
                            parent: category.id,
                            topic: `${lang.guildTemplateCreationParameters.topics.sportChannel}`
                        });
                    }
                }
                if (array.includes("ticketChannel") || array.includes("logsChannel") || array.includes("all") || array.includes("force")) {
                    const ticketCategory = await interaction.guild.channels.create({
                        name: object.string + `📩` + object.string2 + fontedText(fonts[`${categoryfont}`], format(`${lang.channelList.ticketChannel}`)),
                        type: ChannelType.GuildCategory,
                    });
                    await interaction.guild.channels.create({
                        name: object.string + `📋` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.ticketChannel}`)),
                        type: ChannelType.GuildText, parent: ticketCategory.id, permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.UseApplicationCommands] }],
                        topic: `${lang.guildTemplateCreationParameters.topics.ticketChannel}`
                    });
                }
                if (array.includes("adminChannel") || array.includes("logsChannel") || array.includes("all") || array.includes("force")) {
                    const adminCategory = await interaction.guild.channels.create({
                        name: object.string + `❤️` + object.string2 + fontedText(fonts[`${categoryfont}`], format(`${lang.channelList.adminChannel}`)),
                        type: ChannelType.GuildCategory,
                    });
                    if (array.includes("adminChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `📕` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.adminChannel}`)),
                            type: ChannelType.GuildText, parent: adminCategory.id, permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }]
                        });
                    }
                    if (array.includes("logsChannel") || array.includes("all") || array.includes("force")) {
                        await interaction.guild.channels.create({
                            name: object.string + `📜` + object.string2 + fontedText(fonts[`${font}`], format(`${lang.channelList.logsChannel}`)),
                            type: ChannelType.GuildText, parent: adminCategory.id, permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }],
                            topic: `${lang.guildTemplateCreationParameters.topics.logsChannel}`
                        });
                    }
                    const updateChannel = await interaction.guild.channels.create({
                        name: object.string + `📜` + object.string2 + fontedText(fonts[`${font}`], format(`Update`)),
                        type: ChannelType.GuildText, permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }],
                        parent: adminCategory.id,
                        topic: `${lang.guildTemplateCreationParameters.topics.logsChannel}`,
                        position: 1000
                    });
                    database.query(`INSERT INTO update_channels(guild, channelId) VALUES ('${interaction.guild.id}','${updateChannel.id}')`)
                }
                function formatTime(time) {
                    let seconds = Math.floor((time % 60000) / 1000);
                    let milliseconds = time % 1000;
                    return `${parseInt(seconds.toString().padStart(2, '0'), 10)} ${lang.timeUnits.seconds} ${lang.and} ${milliseconds.toString().padStart(2, '0')} ${lang.timeUnits.miliseconds}`;
                }

                const buttons = new ActionRowBuilder()
                    .addComponents(new ButtonBuilder().setCustomId('run').setLabel(`${lang.loadTemplateBlocked}`).setStyle(ButtonStyle.Success).setDisabled(true))
                database.query(`DELETE FROM guild_template WHERE user = '${interaction.user.id}'`);
                let elapsedTime = Date.now() - startTime;
                database.query(`SELECT template FROM created`, (err, rows) => {
                    if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                    if (rows.length) {
                        database.query(`UPDATE created SET template=${rows[0].template + 1}`)
                    }
                })
                interaction.message.edit({ components: [buttons] })
                await interaction.editReply({ embeds: [embed, statEmbed], content: `${lang.taskTimeInfo} ${formatTime(elapsedTime)}` })
            }
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    createTemplate(rows[0].channelparam, rows[0].categorystyle, rows[0].channels)
                } else {
                    interaction.editReply({ content: `${lang.sessionInfo.notExist}`, ephemeral: true })
                }
            })
        } else if (interaction.customId == "editBackupSession") {
            validate(interaction.message.embeds[0], interaction);
            database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, (err, rows) => {
                if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                if (rows.length) {
                    data(rows[0].channelparam, rows[0].emojis, rows[0].categorystyle, rows[0].uuid)
                }
            })
            async function data(channelparam, categorystyle, uuid) {
                const modal = new ModalBuilder()
                    .setCustomId('channelStyle')
                    .setTitle(`${lang.modals.channelStyle.title}`);
                const ChannelStyleInput = new TextInputBuilder()
                    .setCustomId('ChannelStyle')
                    .setLabel(`${lang.modals.channelStyle.channelStyleInput}`)
                    .setMaxLength(4)
                    .setMinLength(1)
                    .setRequired(true)
                    .setPlaceholder('「💻」')
                    .setValue(`${channelparam || "「💻」"}`)
                    .setStyle(TextInputStyle.Short);
                const CategoryChannelStyleInput = new TextInputBuilder()
                    .setCustomId('CategoryStyle')
                    .setLabel(`${lang.modals.channelStyle.categoryStyleInput}`)
                    .setRequired(true)
                    .setPlaceholder(`${lang.modals.channelStyle.placeholderCategory}`)
                    .setMinLength(3)
                    .setMaxLength(40)
                    .setValue(`${categorystyle || "{name}"}`)
                    .setStyle(TextInputStyle.Short);
                // const DescInput = new TextInputBuilder()
                //     .setCustomId('Description')
                //     .setLabel(`${lang.modals.channelStyle.serverDesc}`)
                //     .setRequired(true)
                //     .setValue(`${welcomedesc || lang.modals.channelStyle.descInputValue}`)
                //     .setMaxLength(120)
                //     .setStyle(TextInputStyle.Paragraph);
                const ChannelStyle = new ActionRowBuilder().addComponents(ChannelStyleInput);
                const CategoryChannelStyle = new ActionRowBuilder().addComponents(CategoryChannelStyleInput);
                //const DescStyle = new ActionRowBuilder().addComponents(DescInput);
                modal.addComponents(ChannelStyle, CategoryChannelStyle);
                await interaction.showModal(modal);
            }
        } else if (interaction.customId == "continueSelectmenu") {
            validate(interaction.message.embeds[0], interaction);
            function getGuildType() {
                return new Promise(resolve => {
                    database.query(`SELECT * FROM guild_template WHERE user = '${interaction.user.id}'`, function (err, rows) {
                        if (err) return interaction.reply({ content: `${lang.servicesError}`, ephemeral: true });
                        if (!rows.length) return;
                        resolve(rows[0].guildtype);
                    });
                });
            }
            const guildType = await getGuildType();
            const embed = new EmbedBuilder().setTitle(`${lang.guildTypeOptions.channelGuildTypeOption} ${guildType}`).setFooter({ text: `${lang.guildTypeOptions.amount}` }).setColor('Blurple')
            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder().setCustomId('ChannelsSelectBox').setPlaceholder(`${lang.step} 3`)
                        .addOptions(
                            { label: `${lang.channelList.adminChannel}`, value: 'adminChannel', emoji: { name: 'admin', id: '1066384965828350072' } },
                            { label: `${lang.channelList.logsChannel}`, value: 'logsChannel', emoji: { name: 'logs', id: '1066384694884712469' } },
                            { label: `${lang.channelList.cmdChannel}`, value: 'cmdChannel', emoji: { name: 'cmd', id: '1066350684187938826' } },
                            { label: `${lang.channelList.verifyChannel}`, value: 'verifyChannel', emoji: { name: 'auth', id: '1066388114366541884' } },
                            { label: `${lang.channelList.autoRolesChannel}`, value: 'autoRolesChannel', emoji: { name: 'role', id: '1066389840519778425' } },
                            { label: `${lang.channelList.infoChannel}`, value: 'infoChannel', emoji: { name: 'info', id: '1101301728747458571' } },
                            { label: `${lang.channelList.changelogChannel}`, value: 'changelogChannel', emoji: { name: 'changelog', id: '1101300096039145562' } },
                            { label: `${lang.channelList.giveawayChannel}`, value: 'giveawayChannel', emoji: { name: 'giveaway', id: '1066409829159161896' } },
                            { label: `${lang.channelList.eventChannel}`, value: 'eventChannel', emoji: { name: 'events', id: '1066418219625218069' } },
                            { label: `${lang.channelList.pollChannel}`, value: 'pollChannel', emoji: { name: 'poll', id: '1101300536654954657' } },
                            { label: `${lang.channelList.ticketChannel}`, value: 'ticketChannel', emoji: { name: 'ticket', id: '1101301354061897758' } },
                            { label: `${lang.channelList.memesChannel}`, value: 'memesChannel', emoji: { name: 'memes', id: '1101454127780859958' } },
                            { label: `${lang.channelList.faqChannel}`, value: 'faqChannel', emoji: { name: 'faq', id: '1101300087835078686' } },
                            { label: `${lang.channelList.suggestionChannel}`, value: 'suggestionChannel', emoji: { name: 'suggestion', id: '1101299368717467700' } },
                            { label: `${lang.channelList.offtopChannel}`, value: 'offtopChannel', emoji: { name: 'offtop', id: '1101299491434414162' } },
                            { label: `${lang.channelList.helpChannel}`, value: 'helpChannel', emoji: { name: 'help', id: '1101301889812934726' } }
                        )
                );
            if (guildType == "GuildTypeGame") {
                row.components[0].addOptions(
                    { label: `${lang.channelList.gamesChannel}`, value: 'gamesChannel', emoji: { name: 'amongsus', id: '1066387676602834964' } },
                    { label: `${lang.channelList.codeChannel}`, value: 'codeChannel', emoji: { name: 'code', id: '1066420455902302208' } },
                    { label: `${lang.channelList.technoChannel}`, value: 'technoChannel', emoji: { name: 'tech', id: '1066389015852494969' } },
                    { label: `${lang.channelList.modelsChannel}`, value: 'modelsChannel', emoji: { name: 'Blender', id: '1066440481950674974' } },
                    { label: `${lang.channelList.graphicChannel}`, value: 'graphicChannel', emoji: { name: 'palette', id: '1066403628715360358' } },
                    { label: `${lang.channelList.gamersChannel}`, value: 'gamersChannel', emoji: { name: 'xbox', id: '1066436330382438440' } }
                )
            } else if (guildType == "GuildTypeSocial") {
                row.components[0].addOptions(
                    { label: `${lang.channelList.filmChannel}`, value: 'filmChannel', emoji: { name: 'Netflix', id: '1066389089168937020' } },
                    { label: `${lang.channelList.graphicChannel}`, value: 'graphicChannel', emoji: { name: 'palette', id: '1066403628715360358' } },
                    { label: `${lang.channelList.socialChannel}`, value: 'socialChannel', emoji: { name: 'socials', id: '1101300772102209576' } },
                    { label: `${lang.channelList.bookChannel}`, value: 'bookChannel', emoji: { name: 'wattpad', id: '1066441771636236329' } },
                    { label: `${lang.channelList.sportChannel}`, value: 'sportChannel', emoji: { name: 'football', id: '1066442419677184121' } },
                    { label: `${lang.channelList.boostChannel}`, value: 'boostChannel', emoji: { name: 'nitro', id: '1066340230589849723' } }
                )
            } else if (guildType == "GuildTypeFriends") {
                row.components[0].addOptions({ label: `${lang.channelList.graphicChannel}`, value: 'graphicChannel', emoji: { name: 'palette', id: '1066403628715360358' } });
            }
            await row.components[0].setMaxValues(row.components[0].options.length)
            embed.addFields({ name: `**${lang.channelList.amountOfOptions}**`, value: `**${row.components[0].options.length}**` });
            const embed2 = new EmbedBuilder()
                .setTitle(`${lang.channelList.selectedChannelsToCreate} (${lang.channelList.together} 0)`)
                .setDescription(`**+ ${lang.lack}**`)
                .setTimestamp()
                .setColor('Blurple')
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, format: "png" }) });
            interaction.update({ components: [row], embeds: [embed, embed2] })
        } else if (interaction.customId == "continue3") {
            validate(interaction.message.embeds[0], interaction);
            const row = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('CategoryFont').setPlaceholder(`${lang.step} 5`))
            const embed = new EmbedBuilder().setColor('Blurple').setTitle(`${lang.fontOptions.categoryApplyTitle}`).setDescription(`- ` + fontedText(fonts.Default, `${lang.fontOptions.notSelected}`))
            Object.keys(fonts).forEach(function (key) {
                const text = JSON.stringify(fonts[key])
                const obj = JSON.parse(text);
                row.components[0].addOptions(
                    {
                        value: key,
                        label: key,
                        description: `${obj.a + obj.b + obj.c + obj.d + obj.e + obj.f + obj.g + obj.h + obj.i + obj.j + obj.k + obj.l + obj.m + obj.n + obj.o + obj.p + obj.q + obj.r + obj.s + obj.t + obj.u + obj.v + obj.w + obj.x + obj.y + obj.z}`
                    }
                )
            })
            interaction.update({ components: [row], embeds: [embed] })
        } else if (interaction.customId == ('banchannel')) {
            validate(interaction.message.embeds[0], interaction);
            const guild = interaction.guild;
            if (guild) {
                const channels = guild.channels.cache;
                const maxOptionsPerRow = 25;
                const rows = [];
                let optionsAdded = 0;
                let currentRow;
                let step = 1;

                const usedValues = {};

                channels.forEach((channel) => {
                    const channelName = channel.name;
                    const channelId = channel.id;
                    const emoji = channelName.match(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);

                    let uniqueValue = channelName;

                    if (usedValues[channelName]) {
                        uniqueValue = `${channelName} (${channelId})`;
                    }
                    usedValues[uniqueValue] = true;
                    if (optionsAdded === 0) {
                        currentRow = new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`bannedChannels_${rows.length}`)
                                .setPlaceholder(`${lang.channelList.channelList} ${step}`)
                                .setMaxValues(optionsAdded)
                        );
                    }
                    currentRow.components[0].addOptions({
                        label: `${channelName} (${channelId})`,
                        value: uniqueValue,
                    });

                    optionsAdded++;

                    if (optionsAdded === maxOptionsPerRow) {
                        rows.push(currentRow);
                        optionsAdded = 0;
                        step++;
                    }
                });

                if (optionsAdded > 0) {
                    rows.push(currentRow);
                }

                rows.forEach((row, index) => {
                    row.components[0].setMaxValues(row.components[0].options.length);
                    row.components[0].setPlaceholder(`${lang.channelList.channelList}: ${step + index}`);
                });

                const embed = new EmbedBuilder()
                    .setTitle('Kanały, które mam ignorować podczas usuwania')
                    .addFields({ name: `${lang.channelList.list}`, value: '\u200B' })
                    .setTimestamp();
                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('confirm').setLabel(`${lang.continue}`).setStyle(ButtonStyle.Success)
                );
                await interaction.update({ components: [...rows, buttons], embeds: [embed], fetchReply: true });
            }
        }
        //ModalInteraction
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'channelStyle') {
            validate(interaction.message.embeds[0], interaction);
            const channelStyle = interaction.fields.getTextInputValue('ChannelStyle');
            var style = channelStyle;
            style = style.trim();
            const arr = Array.from(style);
            var charZero = arr[0], charOne = arr[1], charTwo = arr[2];
            const channelStyleShow = `${charZero} ${charOne} ${charTwo}`;
            const categoryStyleShow = interaction.fields.getTextInputValue('CategoryStyle');
            function format(text, name, emotka) {
                const stringWithPlaceholders = text;
                const replacements = {
                    name: name,
                    emoji: emotka
                };
                const string = stringWithPlaceholders.replace(
                    /{\w+}/g,
                    placeholderWithDelimiters => {
                        const placeholderWithoutDelimiters = placeholderWithDelimiters.substring(
                            1,
                            placeholderWithDelimiters.length - 1,
                        );
                        const stringReplacement = replacements[placeholderWithoutDelimiters] || placeholderWithDelimiters;
                        return stringReplacement;
                    },
                );
                return string;
            }
            //const welcomedesc = interaction.fields.getTextInputValue('Description');
            const embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle(`${lang.modals.preview.channelPreviewTitle}`)
                .setDescription(`**${lang.modals.preview.channelPreviewTemplate} \`${channelStyleShow}\`\n\n${lang.modals.preview.categoryPreview}\`\`\`${format(categoryStyleShow, `${lang.modals.preview.textChannels}`, "💬")}\`\`\`**`)//\n${lang.modals.preview.channelPreview}
            //embed.addFields({ name: `${lang.modals.preview.welcomeScreen}`, value: `\`\`\`${welcomedesc}\`\`\`` },)
            const editButton = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('continueSelectmenu').setLabel(`${lang.next}`).setStyle(ButtonStyle.Success))
                .addComponents(new ButtonBuilder().setCustomId('edit').setLabel(`${lang.editor}`).setStyle(ButtonStyle.Success))
            const editButton2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('edit').setDisabled(true).setLabel('Edytor (Sesja wygasła)').setStyle(ButtonStyle.Success))
            database.query(`UPDATE guild_template SET channelparam='${style}',categorystyle='${categoryStyleShow}' WHERE user=${interaction.user.id}`);
            interaction.reply({ components: [editButton], embeds: [embed] });
            const collector = interaction.channel.createMessageComponentCollector({ time: 75000 });
            collector.on('collect', async interaction => {
                if (interaction.customId === 'edit') {
                    const modal = new ModalBuilder()
                        .setCustomId('channelStyleEdit')
                        .setTitle(`${lang.modals.channelStyle.title}`);
                    const ChannelStyleInput = new TextInputBuilder()
                        .setCustomId('ChannelStyle')
                        .setLabel(`${lang.modals.channelStyle.channelStyleInput}`)
                        .setMaxLength(4)
                        .setMinLength(1)
                        .setRequired(true)
                        .setPlaceholder('「💻」')
                        .setValue(channelStyle)
                        .setStyle(TextInputStyle.Short);
                    const CategoryChannelStyleInput = new TextInputBuilder()
                        .setCustomId('CategoryStyle')
                        .setLabel(`${lang.modals.channelStyle.categoryStyleInput}`)
                        .setRequired(true)
                        .setMinLength(3)
                        .setMaxLength(40)
                        .setPlaceholder(`${lang.modals.channelStyle.categoryStyleInput}`)
                        .setValue(categoryStyleShow)
                        .setStyle(TextInputStyle.Paragraph);
                    // const DescInput = new TextInputBuilder()
                    //     .setCustomId('Description')
                    //     .setLabel(`${lang.modals.channelStyle.serverDesc}`)
                    //     .setRequired(true)
                    //     .setValue(welcomedesc)
                    //     .setStyle(TextInputStyle.Paragraph);
                    const ChannelStyle = new ActionRowBuilder().addComponents(ChannelStyleInput);
                    const CategoryChannelStyle = new ActionRowBuilder().addComponents(CategoryChannelStyleInput);
                    //const DescStyle = new ActionRowBuilder().addComponents(DescInput);
                    modal.addComponents(ChannelStyle, CategoryChannelStyle);
                    await interaction.showModal(modal);
                    const test = setTimeout(function () {
                    }, 75000);
                }
            });
            //Edit Panel
        } else if (interaction.customId == "channelStyleEdit") {
            validate(interaction.message.embeds[0], interaction);
            var style = interaction.fields.getTextInputValue('ChannelStyle');
            style = style.trim()
            const arr = Array.from(style)
            var charZero = arr[0], charOne = arr[1], charTwo = arr[2]
            const channelStyleShow = `${charZero} + {Emoji} + ${charTwo}`
            const categoryStyleShow = interaction.fields.getTextInputValue('CategoryStyle');
            //const welcomedesc = interaction.fields.getTextInputValue('Description');
            function format(text, name, emotka) {
                const stringWithPlaceholders = text;
                const replacements = {
                    name: name,
                    emoji: emotka
                };
                const string = stringWithPlaceholders.replace(
                    /{\w+}/g,
                    placeholderWithDelimiters => {
                        const placeholderWithoutDelimiters = placeholderWithDelimiters.substring(1, placeholderWithDelimiters.length - 1);
                        const stringReplacement = replacements[placeholderWithoutDelimiters] || placeholderWithDelimiters;
                        return stringReplacement;
                    },
                );
                return string;
            }
            const embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle(`${lang.modals.preview.channelPreviewTitle}`)
                .setDescription(`**${lang.modals.preview.channelPreviewTemplate} \`${channelStyleShow}\`\n\n${lang.modals.preview.categoryPreview}\`\`\`${format(categoryStyleShow, `${lang.modals.preview.textChannels}`, "💬")}\`\`\`**`)//\n${lang.modals.preview.channelPreview}
            //embed.addFields({ name: `${lang.modals.preview.welcomeScreen}`, value: `\`\`\`${welcomedesc}\`\`\`` });
            database.query(`UPDATE guild_template SET channelparam='${style}',categorystyle='${categoryStyleShow}' WHERE user=${interaction.user.id}`);
            interaction.update({ embeds: [embed] });
        };
    }
};