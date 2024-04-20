const config = require('./config.json');
const mysql = require('mysql');
const { Client, GatewayIntentBits, EmbedBuilder, WebhookClient, ChannelType } = require('discord.js');
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
                    //console.error(writeErr);
                    return;
                }
                fs.appendFile('logs.txt', data, (appendErr) => {
                    if (appendErr) {
                        //console.error(appendErr);
                        return;
                    }
                });
            });
        } else {
            fs.appendFile('logs.txt', data, (appendErr) => {
                if (appendErr) {
                    //console.error(appendErr);
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
            //console.error('Błąd połączenia z bazą danych:', err.stack);
            return;
        }
        console.log('Połączenie z bazą danych zostało nawiązane.');
        setTimeout(() => {
            database.end(function (err) {
                if (err) {
                    //console.error('Błąd zamknięcia połączenia:', err.stack);
                    return;
                }
                console.log('Połączenie z bazą danych zostało zamknięte.');
            });
        }, 10000)
    });

    database.on('error', function (err) {
        //console.error('Błąd połączenia z bazą danych:', err);
        handleDatabaseError(err);
    });
}

initializeDatabaseConnection();

client.login(config.token);
module.exports.client = client;

["events", "logs"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on('error', (error) => {
    console.error('Wystąpił błąd Discord API:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Wystąpił nieobsłużony błąd:', error);
});




const authorizedUserId = '819975329003077685';

client.on('messageCreate', async message => {
    if (message.author.id !== authorizedUserId || message.content.toLowerCase() !== '!wznowienie') return;

    let sentCount = 0;

    client.guilds.cache.forEach(guild => {
        let channel = guild.systemChannel || guild.channels.cache.find(channel => channel.type === ChannelType.GuildText);

        if (!channel) {
            console.log(`Nie można znaleźć odpowiedniego kanału na serwerze ${guild.name}.`);
            return;
        }

        const language = guild.preferredLocale;
        const messageText = language && language.startsWith('en')
            ? `Hey everyone! I'm back in action! 🎉\n\nFeel free to use the command </create_template:1108528052281028688> to create templates for your servers!\n@here\nExplore templates and invite me: https://discord.com/oauth2/authorize?client_id=1055561504935649280&permissions=8&scope=bot%20applications.commands`
            : `Hej wszystkim! Wróciłem do działania! 🎉\n\nZapraszam do korzystania z komendy </create_template:1108528052281028688>, aby tworzyć szablony dla swoich serwerów!\n@here\nOdkryj szablony i zaproś mnie: https://discord.com/oauth2/authorize?client_id=1055561504935649280&permissions=8&scope=bot%20applications.commands`;

        channel.send(messageText)
            .then(() => {
                sentCount++;
                console.log(1)
            })
            .catch(error => {
                console.error(`Wystąpił błąd podczas wysyłania wiadomości na serwerze ${guild.name}: ${error}`);
            });
    });

});




const webhookClient = new WebhookClient({ url: config.reportsDataWebhook });
async function getServerCountYesterday() {
    return new Promise((resolve, reject) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedDate = yesterday.toISOString().slice(0, 10);
        database.query(
            `SELECT * FROM created WHERE DATE(timestamp) = ?`,
            [formattedDate],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            }
        );
    });
}
function getTotalRecordCount() {
    return new Promise((resolve, reject) => {
        database.query(`SELECT COUNT(*) AS recordCount FROM created`, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0].recordCount);
            }
        });
    });
}
async function saveServerCount() {
    initializeDatabaseConnection();
    try {
        const serverCount = client.guilds.cache.size;
        database.query(`INSERT INTO servers_analytics(count) VALUES ('${serverCount}')`);
        console.log(`Zapisano ilość serwerów do tabeli servers_analytics: ${serverCount}`);
    } catch (error) {
        console.error('Błąd podczas zapisywania ilości serwerów do bazy danych:', error);
    }
}
function timeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight - now;
}




client.on('ready', async () => {
    console.log(`Zalogowano jako ${client.user.tag}`);
    setTimeout(function () {
        saveServerCount();
        setInterval(saveServerCount, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight());
});
async function sendData() {
    const serverCountTotal = await getTotalRecordCount();
    const serverCountYesterday = await getServerCountYesterday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const timestampYesterday = yesterday.getTime();
    const yesterdayFormatted = `${yesterday.getDate()}.${yesterday.getMonth() + 1}.${yesterday.getFullYear()}`;
    const embed = new EmbedBuilder()
        .setTitle('Dane raportu z dnia:')
        .setDescription(`**${yesterdayFormatted}**`)
        .addFields(
            { name: `Utworzone szablony`, value: `**${serverCountYesterday.length}**` },
            { name: `Utworzone szablony razem`, value: `**${serverCountTotal}**` },
        )
        .setTimestamp()
        .setColor(0x00FFFF);
    webhookClient.send({
        username: 'Templates - Analityka',
        embeds: [embed],
    });
}
client.on('ready', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0);
    const now = Math.floor(Date.now() / 1000);
    const midnight = Math.floor(date.getTime() / 1000);
    const secTime = midnight - now - 60;
    const computeMinutes = Math.floor(secTime / 60);
    const result = secTime % 60;
    console.log(`Checking updates in ${computeMinutes} minutes and ${result} seconds.`);

    async function changelogSend() {

        const response = await axios.get('https://lj-company.pl/templates/changelog.txt');
        const data = response.data;
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
    };
    const intervalTime = 86400 * 1000;// 24 godziny

    setTimeout(() => {
        initializeDatabaseConnection();
        sendData();
        changelogSend();
        setInterval(() => {
            initializeDatabaseConnection();
            sendData();
            changelogSend();
        }, intervalTime);

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

