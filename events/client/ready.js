const config = require('../../config.json');
const clientConfig = require('../../package.json');
const { ActivityType, WebhookClient, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = async (client) => {
    const api = new Map();
    ["slash-cmd"].forEach(handler => {
        require(`../../handlers/${handler}`)(client);
    });


    client.user.setActivity('/create_template', { type: ActivityType.Playing });
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

    webhookClient.send({
        avatarURL: client.user.avatarURL({ size: 1024 }),
        embeds: [embed]
    });


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

    const interval = 3 * 60 * 1000;

    let previousApiStatus = null;

    // async function checkPastebin() {
    //     try {
    //         const data = await pastebin.getPaste('n7Lapnw9');
    //         const now = new Date();
    //         const timestamp = now.toLocaleString();

    //         let logData;
    //         let apiStatus;
    //         if (data === 'true') {
    //             apiStatus = true;
    //             logData = `${timestamp} Moduł serwisowy został aktywowany.\n`;
    //         } else {
    //             apiStatus = false;
    //             logData = `${timestamp} Sprawdzanie hiayaf.services\n`;
    //         };

    //         fs.access('logs.txt', (err) => {
    //             if (err) {
    //                 fs.writeFile('logs.txt', '', (err) => {
    //                     if (err) {
    //                         return console.error(err);
    //                     };
    //                 });
    //             }

    //             fs.appendFile('logs.txt', logData, (err) => {
    //                 if (err) {
    //                     return console.error(err);
    //                 };
    //             });
    //         });

    //         if (previousApiStatus !== apiStatus) {
    //             const embedModule = new EmbedBuilder()
    //                 .setTitle(apiStatus ? 'Moduł serwisowy został załączony' : 'Moduł serwisowy został wyłączony')
    //                 .addFields(
    //                     { name: 'Status:', value: apiStatus ? 'Włączony' : 'Wyłączony' }
    //                 )
    //                 .setTimestamp()
    //                 .setColor(0xf6ff00);
    //             webhookClient.send({
    //                 avatarURL: client.user.avatarURL({ size: 1024 }),
    //                 embeds: [embedModule]
    //             });
    //         }
    //         previousApiStatus = apiStatus;

    //     } catch (err) {
    //         console.log(err);
    //     }
    // }
    // checkPastebin();
    // setInterval(checkPastebin, interval);
    module.exports.api = api;

};
