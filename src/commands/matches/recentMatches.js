import { SlashCommandBuilder } from 'discord.js';
import { findPlayerByDiscordId } from '#databases/repositories/player.js';
import { sendErrorWithSpoiler } from '#utils/discord.js';

export const data = new SlashCommandBuilder()
  .setName('최근경기')
  .setDescription('최근 경기를 조회합니다. (최대 20개)');

export async function execute(interaction) {
  try {
    await interaction.deferReply();

    const player = findPlayerByDiscordId(interaction.user.id);

    if (!player) {
      const error = new Error('not exist player');
      error.code = 404;

      throw error;
    }

    const res = await fetch(
      `https://api.pubg.com/shards/${player.pubgServer}/players/${player.pubgPlayerId}`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        },
      }
    );
    const data = await res.json();
    console.log(' data =======> ', data.data.relationships.matches);
    await interaction.followUp(
      `최근 경기 수: ${data.data.relationships.matches.data.length}`
    );
  } catch (error) {
    if (error.code === 429) {
      await sendErrorWithSpoiler(
        interaction,
        error,
        '배틀그라운드 API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
      );
    } else if (error.code === 404 && error.message === 'not exist player') {
      await sendErrorWithSpoiler(
        interaction,
        error,
        '디스코드 아이디에 등록된 배틀그라운드 아이디가 없습니다.'
      );
    } else {
      await sendErrorWithSpoiler(interaction, error);
    }
  }
}
