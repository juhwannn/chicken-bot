import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { findPlayerByDiscordId } from '#databases/repositories/player.js';
import { Player } from '#databases/models/player.js';
import { Match } from '#databases/models/match.js';
import { Stats } from '#databases/models/stats.js';

const registerPlayerRecentMatch = async (interaction, pubgServer) => {
  try {
    const { pubgPlayerId: pubgId } = await findPlayerByDiscordId(
      interaction.user.id
    );
    const res = await fetch(
      `${process.env.PUBG_HOST}/${pubgServer}/players/${pubgId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        },
      }
    );
    const { data } = await res.json();

    const matchDataList = data.relationships.matches?.data.map((match) => {
      if (match.type === 'match') {
        return {
          discordId: interaction.user.id,
          pubgPlayerName: data.attributes.name,
          pubgPlayerId: pubgId,
          matchId: match.id,
        };
      }
    });

    console.log(' matchDataList =======> ', matchDataList);

    await Match.insertMany(matchDataList, {
      ordered: false,
    });

    for (const matchData of matchDataList) {
      const res = await fetch(
        `${process.env.PUBG_HOST}/${pubgServer}/matches/${matchData.matchId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
          },
        }
      );
      const resData = await res.json();
      console.log(' resData =======> ', resData);

      const statsData = resData.included.find((player) => {
        console.log(' player.attributes =======> ', player.attributes);

        return player.type === 'participant' && player.attributes === pubgId;
      });

      console.log(' statsData =======> ', statsData);

      await Stats.create({
        matchId: matchData.matchId,
        discordId: interaction.user.id,
        playerId: pubgId,
        kill: statsData.attributes.stats.kills,
        damage: statsData.attributes.stats.damageDealt,
        dbno: statsData.attributes.stats.DBNOs,
        headshoKill: statsData.attributes.stats.headshotKills,
        assists: statsData.attributes.stats.assists,
        boosts: statsData.attributes.stats.boosts,
        heals: statsData.attributes.stats.heals,
        killPlace: statsData.attributes.stats.killPlace,
        killStreaks: statsData.attributes.stats.killStreaks,
        longestKill: statsData.attributes.stats.longestKill,
        revives: statsData.attributes.stats.revives,
      });
      await Stats.insertMany(statsData, {
        ordered: false,
      });
    }

    // stats create
    await interaction.followUp('최근 경기가 등록 되었습니다.');
  } catch (error) {
    throw error;
  }
};

const registerPlayer = async (interaction, pubgId, pubgServer) => {
  const players = await findPlayerByDiscordId(interaction.user.id);

  if (players) {
    await interaction.reply(
      `🚨 이미 등록된 배틀그라운드 아이디가 있습니다. \`${players.pubgPlayerName}\``
    );
    return;
  } else {
    const res = await fetch(
      `${process.env.PUBG_HOST}/${pubgServer}/players?filter[playerNames]=${pubgId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        },
      }
    );

    const playerData = await res.json();

    if (playerData?.errors) {
      if (playerData.errors[0].title === 'Not Found') {
        await interaction.reply(`🚨 존재하지 않는 아이디입니다.`);
      }

      return;
    }

    await Player.create({
      discordId: interaction.user.id,
      pubgPlayerName: playerData.data[0]?.attributes?.name,
      pubgPlayerId: playerData.data[0]?.id,
      playerAttributes: playerData.data[0].attributes,
      playerLinks: playerData.data[0].links,
      pubgServer,
      discordUser: { ...interaction?.user },
    });

    await interaction.reply(
      `✅ ${interaction?.user?.username}님이 배틀그라운드 ${pubgServer}서버 아이디 ${pubgId}를 등록하셨습니다.`
    );
  }
};

export const data = new SlashCommandBuilder()
  .setName('등록')
  .setDescription('디스코드 아이디에 배틀그라운드 아이디를 등록합니다.')
  .addStringOption((option) =>
    option
      .setName('서버')
      .setDescription('배그 서버 선택')
      .setRequired(true)
      .addChoices(
        { name: '🟡 kakao', value: 'kakao' },
        { name: '🔵 steam', value: 'steam' }
      )
  )
  .addStringOption((option) =>
    option
      .setName('아이디')
      .setDescription('당신의 배그 아이디')
      .setRequired(true)
  );

export async function execute(interaction) {
  const pubgId = interaction.options.getString('아이디');
  const pubgServer = interaction.options.getString('서버');

  if (!pubgId) {
    await interaction.reply('🚨 배틀그라운드 아이디를 입력해주세요.');
    return;
  }
  if (!pubgServer) {
    await interaction.reply('🚨 배틀그라운드 서버를 선택해주세요.');
    return;
  }

  await registerPlayer(interaction, pubgId, pubgServer);
  await registerPlayerRecentMatch(interaction, pubgServer);
}
