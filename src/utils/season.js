import { setCache, getCache } from '#utils/cache.js';

export async function getCurrentSeason(pubgServer = 'kakao') {
  try {
    let seasons;
    if (getCache('seasons')) {
      seasons = getCache('seasons');
    } else {
      const res = await fetch(
        `${process.env.PUBG_HOST}/${pubgServer}/seasons`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
          },
        }
      );
      seasons = await res.json();
      setCache('seasons', seasons);
    }

    const currentSeason = seasons.data.find(
      (season) => season.attributes.isCurrentSeason
    );

    return currentSeason.id;
  } catch (error) {
    return error;
  }
}

export async function getCurrentSeasonStats(
  seasonId,
  pubgPlayerId,
  pubgServer = 'kakao'
) {
  try {
    const res = await fetch(
      `${process.env.PUBG_HOST}/${pubgServer}/players/${pubgPlayerId}/seasons/${seasonId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        },
      }
    );
    const seasonStats = await res.json();

    return seasonStats;
  } catch (error) {
    return error;
  }
}

export async function getLastSeasonsId(pubgServer = 'kakao', count = 5) {
  try {
    let seasons = getCache('seasons');
    console.log(' seasons =======> ', seasons);

    if (!seasons) {
      const res = await fetch(
        `${process.env.PUBG_HOST}/${pubgServer}/seasons`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
          },
        }
      );
      console.log(' res.status =======> ', res.status);

      if (res.status === 429) {
        const error = new Error('API rate limit exceeded');
        error.code = 429;

        throw error;
      }

      seasons = await res.json();
      setCache('seasons', seasons);
    }

    // 시즌 ID를 기준으로 정렬 (예: 'division.bro.official.pc-2018-01'에서 연도와 월을 추출하여 정렬)
    const sortedSeasons = seasons.data.sort((a, b) => {
      const getDate = (season) => {
        const match = season.id.match(/(\d{4})-(\d{2})$/);
        return match ? new Date(`${match[1]}-${match[2]}-01`) : new Date(0);
      };
      return getDate(b) - getDate(a);
    });

    // 최근 5개의 시즌 선택
    const recentSeasons = sortedSeasons.slice(1, count + 1);

    return recentSeasons.map((season) => season.id);
  } catch (error) {
    throw error;
  }
}

export async function getSeasonStats(pubgServer, seasonId, mode, pubgPlayerId) {
  try {
    const res = await fetch(
      `${process.env.PUBG_HOST}/${pubgServer}/seasons/${seasonId}/gameMode/${mode}/players?filter[playerIds]=${pubgPlayerId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        },
      }
    );

    if (res.status === 429) {
      const error = new Error('API rate limit exceeded');
      error.code = 429;

      throw error;
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}
