import {
  SlashCommandBuilder,
  UserSelectMenuBuilder,
  ActionRowBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('랭킹')
  .setDescription('최근 경기에서 랭킹을 조회합니다.');

export async function execute(interaction) {
  try {
    await interaction.deferReply();
    const userSelect = new UserSelectMenuBuilder()
      .setCustomId('rank')
      .setPlaceholder('Select multiple users.')
      .setMinValues(1)
      .setMaxValues(4);

    const row1 = new ActionRowBuilder().addComponents(userSelect);

    await interaction.editReply({
      content: 'Select users:',
      components: [row1],
    });
  } catch (err) {
    throw err;
  }
}
