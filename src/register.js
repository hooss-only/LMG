import { REST, Routes } from 'discord.js';
import config from '../config.json' assert { type: "json" };

const commands = [
  {
    name: 'rank',
    description: '오늘 기준 개념글을 알려 드립니다.',
  },
];

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
