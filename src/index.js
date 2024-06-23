import { Client, GatewayIntentBits } from 'discord.js';
import config from '../config.json' assert { type: "json" };
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
	client.channels.fetch('1143189870186082314')
		.then(channel => channel.threads.fetchActive())
		.then(threads => console.log(threads))
		.catch(console.error);


  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(config.token);
