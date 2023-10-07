const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  console.log('[Handler] Załadowano event handler');

  const load = (dirs) => {
    const eventsDir = path.join(__dirname, '..', 'events', dirs);
    const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
      const event = require(path.join(eventsDir, file));
      const eventName = file.split('.')[0];

      client.on(eventName, event.bind(null, client));
      console.log('[Eventy] Załadowano ' + eventName);
    }
  };

  ['client', 'guild'].forEach(load);
};
