const { EmbedBuilder } = require('@discordjs/builders');
const config = require('../../config.json');
const clientConfig = require('../../package.json');
const { Collection, ActivityType, REST, Routes, WebhookClient, MessageEmbed } = require('discord.js');
const fs = require('fs');
const PastebinAPI = require('pastebin-js');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const pastebin = new PastebinAPI({
    'api_dev_key': config.pastebin.key,
    'api_user_name': config.pastebin.username,
    'api_user_password': config.pastebin.password
});
module.exports = async (client) => {
    const database = require('../../index').database;
    const api = new Map();
    client.commands = new Collection();

    for (const file of commandFiles) {
        const command = require(`../../commands/${file}`);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
        console.log(`[Komendy] Pomyślnie wyczytano folder ${file}`);
    }

    const clientId = client.user.id;
    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    };

    client.user.setActivity('/help', { type: ActivityType.Playing });
    console.log('Pomyślnie uruchomiono klienta');
    console.log(`Zalogowano jako ${client.user.tag}`);

    function addZero(i) {
        return i < 10 ? `0${i}` : i.toString();
    };

    const webhookClient = new WebhookClient({ url: config.devInfoWebhook });

    const embed = new EmbedBuilder()
        .setTitle('Pomyślnie uruchomiono klienta')
        .addFields(
            { name: 'readyAt:', value: `<t:${Math.floor(client.readyAt.getTime() / 1000)}:R> (\`${Math.floor(client.readyAt.getTime() / 1000)}\`) (\`${client.readyAt.getUTCMonth() + 1}/${client.readyAt.getUTCDate()}/${client.readyAt.getUTCFullYear()}\`) (\`${addZero(client.readyAt.getHours())}:${addZero(client.readyAt.getMinutes())}:${addZero(client.readyAt.getSeconds())}\`)` },
            { name: 'Wersja:', value: clientConfig.version },
        )
        .setTimestamp()
        .setColor(0x00FFFF);

    // webhookClient.send({
    //   avatarURL: client.user.avatarURL({ size: 1024 }),
    //   username: 'Templates',
    //   embeds: [embed]
    // });

    const interval = 3 * 60 * 1000;

    async function checkPastebin() {
        try {
            const data = await pastebin.getPaste('n7Lapnw9');
            const now = new Date();
            const timestamp = now.toLocaleString();

            let logData;
            let apiStatus;

            if (data === 'true') {
                apiStatus = true;
                logData = `${timestamp} Moduł serwisowy został aktywowany.\n`;
            } else {
                apiStatus = false;
                logData = `${timestamp} Sprawdzanie hiayaf.services\n`;
            };

            fs.access('logs.txt', (err) => {
                if (err) {
                    fs.writeFile('logs.txt', '', (err) => {
                        if (err) {
                            return console.error(err);
                        };
                    });
                }

                fs.appendFile('logs.txt', logData, (err) => {
                    if (err) {
                        return console.error(err);
                    };
                });
            });

            api.set('api', apiStatus);
        } catch (err) {
            console.log(err);
        }
    }

    const now = new Date();
    const timestamp = now.toLocaleString();
    const data = `${timestamp} Pomyślnie uruchomiono klienta ${client.user.tag}\n`;

    fs.access('logs.txt', (err) => {
        if (err) {
            fs.writeFile('logs.txt', '', (err) => {
                if (err) {
                    return console.error(err);
                }
            });
        }
        fs.appendFile('logs.txt', data, (err) => {
            if (err) {
                return console.error(err);

            };
        });
    });

    checkPastebin();

    const intervalId = setInterval(checkPastebin, interval);

    module.exports.api = api;

    const channelId = '1119748175452983316';

    function getTemplateCount() {
        return new Promise((resolve, reject) => {
            database.query('SELECT template FROM created', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0].template);
                };
            });
        });
    };

    // const count = await getTemplateCount();

    // setInterval(() => {
    //     client.channels.fetch(channelId)
    //         .then((channel) => {
    //             channel.setName(`Stworzone szablony: ${count}`);
    //         })
    //         .catch((error) => {
    //             console.error('Wystąpił błąd:', error);
    //         });
    // }, 30 * 60 * 1000);

    // client.channels.fetch(channelId)
    //     .then((channel) => {
    //         channel.setName(`Stworzone szablony: ${count}`);
    //     })
    //     .catch((error) => {
    //         console.error('Wystąpił błąd:', error);
    //     });
};
