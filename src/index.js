import { Client, GatewayIntentBits, EmbedBuilder, ActivityType } from 'discord.js';
import cron from 'node-cron';
import config from '../config.json' assert { type: "json" };
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const getActiveThreads = async () => {
	const gallary = client.channels.fetch(config.gallaryId);
	return gallary.then(channel => channel.threads.fetchActive());
}

const getReactions = async (thread) => {
	const starterMessage = thread.fetchStarterMessage();
	return starterMessage.then(message => message.reactions.cache);
}

const getRanking = async () => {
	const today = new Date();
	const threeDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate()-4);

	let recentPosts = [];
	
	const activeThreads = await getActiveThreads();

	activeThreads.threads.forEach(thread => {
			const threadCreatedDate = thread.createdAt;
			threadCreatedDate.setHours(0, 0, 0, 0);

			if (threadCreatedDate >= threeDaysAgo) {
				recentPosts.push(thread);	
			}
	});
	
	let arr = []
	for (const thread of recentPosts) {
		const reactions = await getReactions(thread);
		const gaechu = reactions.find(reaction => reaction._emoji.name == config.gaechuEmojiName);
		
		if (typeof gaechu != 'undefined') arr.push([thread, gaechu.count+thread.messageCount, gaechu.count]);
	}

	arr.sort((a,b) => b[1]-a[1]);
	return arr.slice(0, 5);
}

const sendRanking = async () => {
	const channel = await client.channels.fetch(config.rankChannelId);
	const embed = await getRankingEmbed();

	channel.send({ embeds: [embed] });
}

const getRankingEmbed = async () => {
	let ranking = []
	await getRanking().then(rank => ranking = rank);
	let description = "";
	let i = 1;
	ranking.forEach(post => {
		description += `${i}. https://discord.com/channels/${config.guildId}/${post[0].id} / ${config.gaechuEmojiName}: ${post[2]} / 댓글: ${post[0].messageCount}\n`;
		i+=1;
	});

	const rankingEmbed = new EmbedBuilder()
		.setTitle('오늘의 개념글')
		.setColor(0x4b59a7)
		.setTimestamp()
		.setFooter({ text: '최근 5일 상위 5개글' })
		.setDescription(description);
	return rankingEmbed;
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'rank') {
		const rankingEmbed = await getRankingEmbed()
		await interaction.reply({ embeds: [rankingEmbed] });
  }

	if (interaction.commandName === 'ping') {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true});
		const embed = new EmbedBuilder()
			.setTitle('🏓 Pong')
			.setDescription(`Uptime: ${Math.round(interaction.client.uptime / 60000)}\nLatency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
			.setTimestamp();

    await interaction.editReply({ content: '', embeds: [embed] })		// await interaction.reply({ embeds: [embed], ephemeral: true });
	}
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
	
	client.user.setActivity({
		name: '르마갤',
		type: ActivityType.Watching,
		url: `https://discord.com/channels/${config.guildId}/${config.gallaryId}`
	});

	cron.schedule("0 0,12,22 * * *", () => {
		console.log('sent a ranking');
		sendRanking();
	});
});

client.login(config.token);
