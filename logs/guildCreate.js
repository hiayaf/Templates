const { EmbedBuilder, WebhookClient } = require('discord.js');
const config = require('../config.json');

module.exports = async (client, guild) => {
    const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1160531433341849600/ZLRQ7NLbzOe2Vq5SlEITrCCwYSSbVVQ3VycYb-F2OHCbTohR_uX8jCQr8y4i7mryLc3e' });
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Dodano do nowego serwera')
        .setAuthor({ name: `${guild.name}`, iconURL: `${guild.iconURL({ dynamic: true })}` })
        .addFields(
            { name: `Liczba użytkowników`, value: `${guild.memberCount}` }
        )
    webhookClient.send({
        username: 'Templates - Analityka',
        embeds: [embed],
    });
};
