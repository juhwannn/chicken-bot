import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('성재현')
  .setDescription('???');

export async function execute(interaction) {
  await interaction.reply('돈갚아');
}
