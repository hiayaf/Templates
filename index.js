const config = require('./config.json');
const mysql = require('mysql');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],
    rest: 0,
    waitGuildTimeout: 0
});
var database = mysql.createConnection('mysql://user:pass@host/db?debug=false');

function keepAlive() {
    database.query('SELECT 1 + 1 AS solution', function (err) {
        if (err) {
            console.log(err.code);
        };
    });
}
setInterval(keepAlive, 120000);
function handleDatabaseError(err) {
    const now = new Date();
    const timestamp = now.toLocaleString();
    const data = `${timestamp} Wystąpił nieoczekiwany błąd bazy danych:\n${err}\n`;
    fs.access('logs.txt', (err) => {
        if (err) {
            fs.writeFile('logs.txt', '', (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        }
        fs.appendFile('logs.txt', data, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    });
}

function connectToDatabase() {
    database.connect((err) => {
        if (err) {
            handleDatabaseError(err);
            console.log('Próba ponownego połączenia z bazą danych...');
            setTimeout(connectToDatabase, 60000);
        } else {
            keepAlive()
            console.log('Pomyślnie połączono z bazą danych');
        }
    });
}

database.on('error', (err) => {
    handleDatabaseError(err);
    console.log('Próba ponownego połączenia z bazą danych...');
    setTimeout(connectToDatabase, 200000);
});

connectToDatabase();


client.login(config.token);
module.exports.client = client;
module.exports.database = database;

["events", "logs"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on('error', (error) => {
    console.error('Wystąpił błąd Discord API:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Wystąpił nieobsłużony błąd:', error);
});

client.on('ready', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0);
    const now = Math.floor(Date.now() / 1000);
    const midnight = Math.floor(date.getTime() / 1000);
    const secTime = midnight - now;
    const computeMinutes = Math.floor(secTime / 60);
    const result = secTime % 60;
    console.log(`Checking updates in ${computeMinutes} minutes and ${result} seconds.`);

    function changelogSend() {
        const PastebinAPI = require('pastebin-js');
        const pastebin = new PastebinAPI({
            'api_dev_key': config.pastebin.key,
            'api_user_name': config.pastebin.username,
            'api_user_password': config.pastebin.password
        });

        pastebin.getPaste('SUCRpiL5')
            .then(function (data) {
                const changelogDate = data.substring(0, data.indexOf(' '));
                const changelog = data.slice(changelogDate.length + 1, data.length);
                const dateChangelog = new Date();
                const day = dateChangelog.getDate();
                const month = dateChangelog.getMonth();
                const year = dateChangelog.getFullYear();
                const checkdate = `${day}.${month}.${year}`;
                if (checkdate === changelogDate) {
                    const embed = new EmbedBuilder()
                        .setColor('DarkGreen')
                        .setTitle('Info')
                        .setTimestamp()
                        .setDescription(changelog);
                    database.query('SELECT channelId FROM update_channels', (err, rows) => {
                        if (rows.length) {
                            for (let i = 0; i < rows.length; i++) {
                                const channelId = rows[i].channelId;
                                const channel = client.channels.cache.get(channelId);
                                if (channel) {
                                    channel.send({ embeds: [embed] })
                                        .catch((error) => console.error(`Błąd podczas wysyłania wiadomości na kanał o ID: ${channelId}`, error));
                                } else {
                                    console.log(`Nie znaleziono kanału o ID: ${channelId}`);
                                };
                            };
                        };
                    });
                };
            })
            .catch(function (err) {
                console.log(err);
            });
    };

    setTimeout(() => {
        changelogSend();
        setInterval(() => {
            changelogSend();
        }, 86400 * 1000);
    }, secTime * 1000);
});

module.exports.fontedText = function fontedText(font, string) {
    if (font) {
        const letters = {
            a: font.a,
            b: font.b,
            c: font.c,
            d: font.d,
            e: font.e,
            f: font.f,
            g: font.g,
            h: font.h,
            i: font.i,
            j: font.j,
            k: font.k,
            l: font.l,
            m: font.m,
            n: font.n,
            o: font.o,
            p: font.p,
            q: font.q,
            r: font.r,
            s: font.s,
            t: font.t,
            u: font.u,
            v: font.v,
            w: font.w,
            x: font.x,
            y: font.y,
            z: font.z
        };
        const chars = Array.from(string.toLowerCase());
        let fontedText = '';
        for (let i = 0; i < chars.length; i++) {
            const letter = chars[i];
            if (letters[letter]) {
                fontedText += letters[letter];
            } else if (letter === undefined) {
                fontedText = fontedText;
            } else {
                fontedText += letter;
            };
        }
        return fontedText;
    } else {
        return string;
    };
};