const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
const config = require('../config.json');
var colors = require('colors')
module.exports = async (client) => {
    client.commands = new Collection();

    // Wczytywanie komend z folderu commands
    const commandFiles = fs.readdirSync('./commands/commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`../commands/commands/${file}`);
        client.commands.set(command.data.name, command);
        console.log(`[Komendy] Pomyślnie wczytano komendę ${command.data.name}`);
    }

    // Odświeżanie globalnych (/) komend
    const commands = client.commands.map(command => command.data.toJSON());
    const clientId = client.user.id;
    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
        console.log(`Rozpoczęto odświeżanie ${commandFiles.length} globalnych (/) komend.`.cyan);
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Pomyślnie odświeżono globalne (/) komendy.');
    } catch (error) {
        console.error(error);
    }

    // Odświeżanie komend dla gildii
    const guildId = config.developer.devGuild;
    const developerCommands = [];
    const developerCommandFiles = fs.readdirSync('./commands/developer').filter(file => file.endsWith('.js'));
    for (const file of developerCommandFiles) {
        const command = require(`../commands/developer/${file}`);
        developerCommands.push(command.data.toJSON());
        console.log(`[Komendy] Pomyślnie wczytano komendę deweloperską ` + `${command.data.name}`.magenta);
    }
    try {
        console.log(`Rozpoczęto odświeżanie ${developerCommands.length} komend dla serwera dewelopera.`.blue);
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: developerCommands });
        console.log(`Pomyślnie odświeżono ${developerCommands.length} komendy dla serwera dewelopera.`.green);
    } catch (error) {
        console.error(error);
    }

};
