const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
  getCurrentSeason,
  getCurrentSeasonStats,
  getLastSeasonsId,
  getSeasonStats,
} = require('../../utils/season');
const fs = require('fs');
const path = require('path');

const playersFilePath = path.join(__dirname, '../../data/players.json');

const getPlayer = (discordId) => {
  let player = {};
  if (fs.existsSync(playersFilePath)) {
    const data = fs.readFileSync(playersFilePath, 'utf8');
    player = JSON.parse(data);
  }
  return player[discordId];
};

const excludeUnplayedModes = (games) => {
  return Object.fromEntries(
    Object.entries(games).filter(([_, stats]) => stats.roundsPlayed > 0)
  );
};

const modeTranslations = {
  solo: '솔로',
  'solo-fpp': '솔로 (1인칭)',
  duo: '듀오',
  'duo-fpp': '듀오 (1인칭)',
  squad: '스쿼드',
  'squad-fpp': '스쿼드 (1인칭)',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('내정보')
    .setDescription(
      '디스코드 아이디에 등록된 배틀그라운드 아이디를 가져옵니다.'
    ),
  async execute(interaction) {
    const player = getPlayer(interaction.user.id);

    const embed = new EmbedBuilder()
      .addFields(
        {
          name: '👤 **디스코드**',
          value: player?.discordUser?.username,
          inline: false,
        },
        { name: '🛡️ **서버**', value: player?.pubgServer, inline: false },
        {
          name: '🎮 **PUBG ID**',
          value: `\`${player?.pubgPlayerId}\``,
          inline: false,
        }
      )
      .setColor(0xffffff)
      .setThumbnail(interaction.user.displayAvatarURL());

    await interaction.reply({
      embeds: [embed],
    });

    const currentSeasonId = await getCurrentSeason(player.pubgServer);
    const currentSeasonStats = await getCurrentSeasonStats(
      currentSeasonId,
      player.pubgPlayerId,
      player.pubgServer
    );
    const lastFiveSeasonIds = await getLastSeasonsId(player.pubgServer, 5);
    const gameStats = excludeUnplayedModes(
      currentSeasonStats.data.attributes.gameModeStats
    );

    for (const mode of Object.keys(gameStats)) {
      const stats = gameStats[mode];
      const title = modeTranslations[mode] || mode;
      const seasonsStats = [];

      for (const seasonId of lastFiveSeasonIds) {
        const seasonStats = await getSeasonStats(
          player.pubgServer,
          seasonId,
          mode,
          player.pubgPlayerId
        );

        seasonsStats.push({
          seasonId,
          seasonLabel: seasonId.slice(-2) + ' 시즌',
          KAM: (
            (seasonStats.data[0].attributes.gameModeStats[mode].kills +
              seasonStats.data[0].attributes.gameModeStats[mode].assists) /
            seasonStats.data[0].attributes.gameModeStats[mode].roundsPlayed
          ).toFixed(2),
          roundsPlayed:
            seasonStats.data[0].attributes.gameModeStats[mode].roundsPlayed,
            
        });
      }
      const chartConfig = {
        type: 'bar',
        data: {
          labels: [
            seasonsStats[0].seasonLabel,
            seasonsStats[1].seasonLabel,
            seasonsStats[2].seasonLabel,
            seasonsStats[3].seasonLabel,
            seasonsStats[4].seasonLabel,
          ],
          datasets: [
            {
              label: '평균 K + A / M',
              data: [
                seasonsStats[0].KAM,
                seasonsStats[1].KAM,
                seasonsStats[2].KAM,
                seasonsStats[3].KAM,
                seasonsStats[4].KAM,
              ],
              backgroundColor: [
                '#FF6384',
                '#FF6384',
                '#FF6384',
                '#FF6384',
                '#FF6384',
              ],
              // '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
            {
              type: 'line',
              label: '평균 딜량',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 2,
              fill: false,
              data: [
                seasonsStats[0].
              ],
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: '시즌 별 스탯',
          },
        },
      };

      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
        JSON.stringify(chartConfig)
      )}`;

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`**${player.pubgPlayerName}님 ${title} 전적 정보**`)
        .setDescription(`이번 시즌 ${title} 게임 전적입니다.`)
        .addFields(
          {
            name: 'Kill + Assist / Match',
            value: `${(
              (stats.kills + stats.assists) /
              stats.roundsPlayed
            ).toFixed(2)}`,
            inline: true,
          },
          {
            name: 'Kill / Match',
            value: `${(stats.kills / stats.roundsPlayed).toFixed(2)}`,
            inline: true,
          },
          {
            name: '헤드샷',
            value: `${((stats.headshotKills / stats.kills) * 100).toFixed(2)}%`,
            inline: true,
          },
          {
            name: '플레이한 라운드 수',
            value: `${stats.roundsPlayed}`,
            inline: true,
          },
          { name: '승리 수', value: `${stats.wins}`, inline: true },
          { name: '패배 수', value: `${stats.losses}`, inline: true },
          {
            name: '최장 거리 킬',
            value: `${stats.longestKill.toFixed(2)}m`,
            inline: true,
          },
          {
            name: '부활 시도 수',
            value: `${stats.revives}`,
            inline: true,
          },
          { name: '팀킬 수', value: `${stats.teamKills}`, inline: true }
        )
        .setImage(chartUrl);

      await interaction.followUp({ embeds: [embed] });
    }
  },
};
