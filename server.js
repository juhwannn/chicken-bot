import dotenv from 'dotenv';
import QuickChart from 'quickchart-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'node:fs/promises';
import { calculateScore, generateRankText } from '#utils/score.js';
import {
  Collection,
  Client,
  GatewayIntentBits,
  Events,
  MessageFlags,
  EmbedBuilder,
} from 'discord.js';
import { Player } from '#databases/models/player.js';
import { Match } from '#databases/models/match.js';
import { Stats } from '#databases/models/stats.js';
import { connectDB } from '#databases/index.js';
import { insertManyMatchByPlayer } from '#databases/repositories/match.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @see {@link https://discordjs.guide/slash-commands/response-methods.html}
 */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

const foldersPath = join(__dirname, 'src/commands');
const commandFolders = await fs.readdir(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = (await fs.readdir(commandsPath)).filter((file) =>
    file.endsWith('.js')
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const { data, execute } = await import(`file://${filePath}`);

    if (data && execute) {
      client.commands.set(data.name, { data, execute });
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const replyPayload = {
      content: 'There was an error while executing this command!',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyPayload);
    } else {
      await interaction.reply(replyPayload);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isUserSelectMenu()) return;
    await interaction.deferReply();

    if (interaction.customId === 'rank') {
      const selectedUsers = interaction.users;
      // const selectedUserIds = interaction.values;
      const selectedUserIds = [
        '248614353081860097',
        '280360474304839680',
        '405199908589535254',
        '383664125164912641',
      ];
      // const names = selectedUsers
      //   .map((user) => user.globalName ?? user.username)
      //   .join(', ');

      // await interaction.update({
      //   content: `✅ 선택된 유저: ${names}`,
      //   components: [],
      // });

      // for (const selectedUserId of selectedUserIds) {
      //   const player = await Player.findOne({
      //     discordId: selectedUserId,
      //   });

      //   await insertManyMatchByPlayer(player);
      // }

      const matchIdList = await Match.aggregate([
        {
          $match: {
            discordId: { $in: selectedUserIds },
          },
        },
        {
          $group: {
            _id: '$matchId',
            discordIds: { $addToSet: '$discordId' },
            gameStartedAt: { $first: '$gameStartedAt' },
          },
        },
        {
          $match: {
            discordIds: { $all: selectedUserIds },
          },
        },
        { $sort: { gameStartedAt: -1 } },
        { $limit: 20 },
        { $project: { _id: 0, matchId: '$_id' } },
      ]);

      const test = matchIdList.map((match) => match.matchId);
      const stats = await Stats.aggregate([
        {
          $match: {
            matchId: { $in: test },
            discordId: { $in: selectedUserIds },
          },
        },
        {
          $group: {
            _id: '$discordId',
            avgKill: { $avg: '$kill' },
            avgDamage: { $avg: '$damage' },
            avgDBNO: { $avg: '$dbno' },
            avgAssists: { $avg: '$assists' },
            avgHeadshotKill: { $avg: '$headshotKill' },
            avgBoosts: { $avg: '$boosts' },
            avgHeals: { $avg: '$heals' },
            avglongestKill: { $avg: '$longestKill' },
            avgRevives: { $avg: '$revives' },
            totalMatches: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'players',
            localField: '_id',
            foreignField: 'discordId',
            as: 'playerInfo',
          },
        },
        {
          $unwind: '$playerInfo',
        },
        {
          $project: {
            avgKill: 1,
            avgDamage: 1,
            avgDBNO: 1,
            avgAssists: 1,
            avgHeadshotKill: 1,
            avgBoosts: 1,
            avgHeals: 1,
            avglongestKill: 1,
            avgRevives: 1,
            totalMatches: 1,
            pubgPlayerName: '$playerInfo.pubgPlayerName',
            pubgPlayerId: '$playerInfo.pubgPlayerId',
            discordUser: '$playerInfo.discordUser',
          },
        },
      ]);

      const scoreList = stats.map((stat) => {
        const score = calculateScore(stat);
        return {
          pubgPlayerName: stat.pubgPlayerName,
          discordUserName:
            stat.discordUser.globalName ?? stat.discordUser.username,
          score,
        };
      });

      const chart = new QuickChart();
      chart.setVersion('3');
      chart.setBackgroundColor('#1C1C1C');
      chart.setConfig({
        type: 'bar',
        data: {
          labels: scoreList.map((p) => p.pubgPlayerName),
          datasets: [
            {
              label: '점수',
              data: scoreList.map((p) => p.score),
              backgroundColor: ['#4DB546', '#3A74E3', '#E2A600', '#E04B8C'],
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              suggestedMin: 0,
              ticks: {
                color: '#FFFFFF',
              },
            },
            x: {
              ticks: {
                color: '#FFFFFF',
              },
            },
          },
          plugins: {
            title: {
              display: false,
              color: '#FFFFFF',
              font: {
                size: 18,
              },
            },
            legend: {
              display: false,
            },
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: '#FFFFFF',
              font: {
                weight: 'bold',
                size: 12,
              },
              formatter: (value) => value.toFixed(1),
            },
          },
        },
      });

      const embed = new EmbedBuilder()
        .setImage(chart.getUrl())
        .setColor('Blue');

      await interaction.followUp({
        content: generateRankText(scoreList),
        embeds: [embed],
      });
    }
  } catch (error) {
    throw error;
  }
});

connectDB().then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
