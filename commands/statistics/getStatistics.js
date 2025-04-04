const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadPlayers() {
  const playersFilePath = path.join(__dirname, '../../data/players.json');

  if (!fs.existsSync(playersFilePath)) return {};
  return JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));
}

async function getRecentStats(pubgPlayerId, pubgServer) {
  const headers = {
    Accept: 'application/vnd.api+json',
    Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
  };

  // 1. 플레이어 정보 (매치 ID 포함)
  const playerRes = await fetch(
    `${process.env.PUBG_HOST}/${pubgServer}/players/${pubgPlayerId}`,
    {
      headers,
    }
  );
  const playerData = await playerRes.json();

  const matchRefs = playerData.data.relationships.matches.data;

  const oneDayAgo = Date.now() - 1000 * 60 * 60 * 24;

  let totalKills = 0;
  let totalDamage = 0;
  let totalAssists = 0;
  let totalTime = 0;
  let totalDBNOs = 0;
  let totalPlace = 0;
  let matchCount = 0;

  for (let i = 0; i < Math.min(matchRefs.length, 10); i++) {
    const matchId = matchRefs[i].id;
    const matchRes = await fetch(
      `${process.env.PUBG_HOST}/${pubgServer}/matches/${matchId}`,
      {
        headers,
      }
    );
    const matchData = await matchRes.json();

    const matchTime = new Date(matchData.data.attributes.createdAt);
    if (matchTime.getTime() < oneDayAgo) continue;

    const participants = matchData.included.filter(
      (e) => e.type === 'participant'
    );
    const player = participants.find(
      (p) => p.attributes.stats.playerId === pubgPlayerId
    );

    if (!player) continue;

    const stats = player.attributes.stats;

    totalKills += stats.kills || 0;
    totalDamage += stats.damageDealt || 0;
    totalAssists += stats.assists || 0;
    totalTime += stats.timeSurvived || 0;
    totalDBNOs += stats.DBNOs || 0;
    totalPlace += stats.winPlace || 0;

    matchCount++;
  }

  if (matchCount === 0) return null;

  return {
    avgKills: (totalKills / matchCount).toFixed(2),
    avgDamage: (totalDamage / matchCount).toFixed(1),
    avgAssists: (totalAssists / matchCount).toFixed(2),
    avgSurviveTime: (totalTime / matchCount).toFixed(1),
    avgWinPlace: (totalPlace / matchCount).toFixed(1),
    matchCount,
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('전적조회')
    .setDescription(
      '현재 디스코드 음성 채널에 접속중인 사용자들의 전적을 조회합니다.'
    ),
  async execute(interaction) {
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

    const players = loadPlayers();

    const members = [...targetChannel.members.values()];
    const userIds = members.map((m) => m.user.id);

    const pubgPlayerIds = userIds.map((userId) => {
      return players[userId];
    });

    // await interaction.reply(
    //   `📊 ${pubgPlayerIds.length}명의 PUBG 전적을 조회 중입니다...`
    // );
    await interaction.deferReply();

    // 2. 각 유저의 최근 전적 가져오기 + 평균 점수 계산 (가상의 예시)
    const result = await Promise.all(
      pubgPlayerIds.map(async ({ pubgPlayerId, pubgServer }) => {
        try {
          const stats = await getRecentStats(pubgPlayerId, pubgServer); // 전적 가져오기

          // 전적이 없는 경우 예외 처리
          if (
            !stats ||
            !stats.recentMatches ||
            stats.recentMatches.length === 0
          ) {
            throw new Error(
              `❌ ${pubgPlayerId}의 최근 24시간 전적이 없습니다.`
            );
          }

          // 필요한 데이터 반환
          return {
            pubgPlayerId,
            stats,
          };
        } catch (error) {
          console.error(error.message);
          return { pubgPlayerId, error: error.message }; // 에러 메시지 포함
        }
      })
    );

    // 전적이 없는 유저 필터링
    const invalidResults = result.filter((r) => r.error);

    // 전적이 없는 유저에 대한 메시지 추가
    if (invalidResults.length > 0) {
      const invalidUsers = invalidResults.map((r) => r.pubgPlayerId).join(', ');
      await interaction.followUp(
        `🚨 다음 유저의 전적을 찾을 수 없습니다: ${invalidUsers}`
      );
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎧 음성 채널: ${targetChannel.name}`)
      .setDescription(`현재 접속 중인 유저:\n${userIds}`)
      .setColor(0x00aeff);

    await interaction.editReply({ embeds: [embed] });
  },
};
