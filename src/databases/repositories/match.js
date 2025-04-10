import { Match } from '#databases/models/match.js';
import { Player } from '#databases/models/player.js';
import { Stats } from '#databases/models/stats.js';

async function insertManyMatchByPlayer(player = {}) {
  try {
    const res = await fetch(
      `${process.env.PUBG_HOST}/${player.pubgServer}/players/${player.pubgPlayerId}`,
      {
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
          discordId: player.discordId,
          pubgPlayerName: data.attributes.name,
          pubgPlayerId: player.pubgPlayerId,
          matchId: match.id,
        };
      }
    });

    try {
      await Match.insertMany(matchDataList, {
        ordered: false,
      });
    } catch (err) {
      if (err.code === 11000 || err.writeErrors) {
        console.warn(
          '⚠️ 일부 중복된 Match 문서가 존재합니다. 계속 진행합니다.'
        );
      } else {
        console.error('❌ Match insertMany 실패:', err);
        throw err; // 중복 외 에러는 그대로 throw
      }
    }

    return matchDataList;
  } catch (error) {
    throw error;
  }
}

async function insertManyStatsByMatchIdList(matchList = [], player = {}) {
  try {
    for (const match of matchList) {
      const res = await fetch(
        `${process.env.PUBG_HOST}/${player.pubgServer}/matches/${match.matchId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
          },
        }
      );
      const resData = await res.json();

      const statsData = resData.included.find((p) => {
        return (
          p.type === 'participant' &&
          p.attributes.stats.playerId === player.pubgPlayerId
        );
      });

      try {
        await Stats.create({
          matchId: match.matchId,
          discordId: player.discordId,
          playerId: player.pubgPlayerId,
          kill: statsData.attributes.stats.kills,
          damage: statsData.attributes.stats.damageDealt,
          dbno: statsData.attributes.stats.DBNOs,
          headshoKill: statsData.attributes.stats.headshotKills,
          assists: statsData.attributes.stats.assists,
          boosts: statsData.attributes.stats.boosts,
          heals: statsData.attributes.stats.heals,
          killPlace: statsData.attributes.stats.killPlace,
          killStreaks: statsData.attributes.stats.killStreaks,
          teamKills: statsData.attributes.stats.teamKills,
          longestKill: statsData.attributes.stats.longestKill,
          revives: statsData.attributes.stats.revives,
        });

        await Match.updateOne(
          { matchId: match.matchId },
          {
            $set: {
              gameStartedAt: resData.data.attributes.createdAt,
              gameDuration: resData.data.attributes.duration,
            },
          }
        );
      } catch (error) {
        if (error.code === 11000 || error.writeErrors) {
          console.warn(
            '⚠️ 일부 중복된 Stats 문서가 존재합니다. 계속 진행합니다.'
          );
        } else {
          console.error('❌ Stats create 실패:', error);
          throw error; // 중복 외 에러는 그대로 throw
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

export { insertManyMatchByPlayer, insertManyStatsByMatchIdList };
