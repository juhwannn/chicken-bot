import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { findPlayerByDiscordIds } from '../../databases/repositories/player.js';
import { Match } from '#databases/models/match.js';

export const data = new SlashCommandBuilder()
  .setName('전적조회')
  .setDescription(
    '현재 디스코드 음성 채널에 접속중인 사용자들의 전적을 조회합니다.',
    ''
  );

// match
// - discordId;
// - pubgPlayerName;
// - pubgPlayerId;
// - matchId;
// player
// - player 정보
// stats
// - pubgPlayerId
// - matchId
// - stats

export async function execute(interaction) {
  await interaction.deferReply();

  const voiceChannels = interaction.guild.channels.cache.filter(
    (channel) => channel.type === 2 // 2 = GuildVoice
  );

  let targetChannel = null;

  for (const [id, channel] of voiceChannels) {
    if (channel.members.size > 0) {
      targetChannel = channel;
      break; // 첫 번째 유저가 존재하는 채널 선택 (원하면 전부 순회 가능)
    }
  }

  if (!targetChannel) {
    await interaction.reply('❌ 현재 어떤 음성 채널에도 유저가 없습니다.');
    return;
  }

  const members = [...targetChannel.members.values()];
  const discordIds = members.map((m) => m.user.id);

  const playerIds = await findPlayerByDiscordIds(discordIds);
  const pubgIds = playerIds.map((p) => p.pubgPlayerId) || [];

  const res = await fetch(
    `https://api.pubg.com/shards/kakao/players?filter[playerIds]=${pubgIds.join(
      ','
    )}`,
    {
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
      },
    }
  );
  const data = await res.json();

  const matchIdLists = data.data.map(
    (player) => player.relationships?.matches?.data?.map((m) => m.id) || []
  );

  const commonMatchIdList = matchIdLists.reduce(
    (acc, ids) => acc.filter((id) => ids.includes(id)),
    matchIdLists[0] || []
  );

  for (const matchId of commonMatchIdList) {
    const response = await fetch(
      `https://api.pubg.com/shards/kakao/matches/${matchId}`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        },
      }
    );
    const matchData = await response.json();
    const tt = Match.create({
      discordId: '',
      pubgPlayerName: '',
      pubgPlayerId: '',
      matchId: '',
    });

    const test = matchData.included.filter((item) => {
      return pubgIds.includes(item?.attributes?.stats?.playerId);
    });
    console.log(' test =======> ', test);
    console.log(' test =======> ', test[0].attributes.stats);
  }

  // console.log(' matchStatisticList =======> ', matchStatisticList.length);

  // matchStatisticList.forEach((match) => {
  //   console.log(' match =======> ', match);
  // });

  const embed = new EmbedBuilder()
    .setTitle(`🎧 음성 채널: ${targetChannel.name}`)
    .setDescription(`현재 접속 중인 유저:\n`)
    .setColor(0x00aeff);

  await interaction.editReply({ embeds: [embed] });
}
