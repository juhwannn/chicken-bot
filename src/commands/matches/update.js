import { SlashCommandBuilder } from 'discord.js';
import { findPlayerByDiscordId } from '#databases/repositories/player.js';
import {
  insertManyMatchByPlayer,
  insertManyStatsByMatchIdList,
} from '#databases/repositories/match.js';
import { sendErrorWithSpoiler } from '#utils/discord.js';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setNameLocalizations({
    ko: '전적',
  })
  .setDescription('Manage match statistics')
  .setDescriptionLocalizations({
    ko: '전적 통계를 관리합니다.',
  })
  .addSubcommand((sub) =>
    sub
      .setName('update')
      .setNameLocalizations({
        ko: '업데이트',
      })
      .setDescription('Update recent match statistics')
      .setDescriptionLocalizations({
        ko: '최근 경기 전적을 업데이트합니다.',
      })
      .addUserOption((opt) =>
        opt
          .setName('target')
          .setNameLocalizations({ ko: '대상' })
          .setDescription('Choose a user to update')
          .setDescriptionLocalizations({
            ko: '전적을 업데이트할 사용자를 선택하세요.',
          })
          .setRequired(true)
      )
  );

export async function execute(interaction) {
  try {
    await interaction.deferReply();

    let replyContent = ``;
    const selectedUser = interaction.options.getUser('대상');
    console.log(' selectedUser =======> ', selectedUser);

    replyContent += `✅ 선택된 유저: ${selectedUser?.username}\n`;
    await interaction.reply({
      content: replyContent,
    });
    //248614353081860097
    //280360474304839680
    //405199908589535254
    //383664125164912641
    const player = await findPlayerByDiscordId('383664125164912641');

    if (!player) {
      const error = new Error('not exist player');
      error.code = 404;

      throw error;
    }

    replyContent += `ℹ️ 플레이어 아이디: ${player.pubgPlayerName}\n`;
    await interaction.editReply({
      content: replyContent,
    });

    const matchList = await insertManyMatchByPlayer(player);
    await insertManyStatsByMatchIdList(matchList, player);

    replyContent += `✅ 최근 경기 업데이트 완료!\n`;
    await interaction.editReply({
      content: replyContent,
    });
  } catch (error) {
    // if (error.code === 429) {
    //   await sendErrorWithSpoiler(
    //     interaction,
    //     error,
    //     '배틀그라운드 API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    //   );
    // } else if (error.code === 404 && error.message === 'not exist player') {
    //   await sendErrorWithSpoiler(
    //     interaction,
    //     error,
    //     '디스코드 아이디에 등록된 배틀그라운드 아이디가 없습니다.'
    //   );
    // } else {
    //   await sendErrorWithSpoiler(interaction, error);
    // }
    throw error;
  }
}
