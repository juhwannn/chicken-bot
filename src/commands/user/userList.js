import { SlashCommandBuilder } from 'discord.js';
import { Player } from '#databases/models/player.js';

export const data = new SlashCommandBuilder()
  .setName('유저목록')
  .setDescription('등록이 완료된 유저들의 리스트들을 불러옵니다.');

export async function execute(interaction) {
  try {
    const players = await Player.find();
    console.log(' players =======> ', players);
  } catch (err) {
    throw err;
  }
}
