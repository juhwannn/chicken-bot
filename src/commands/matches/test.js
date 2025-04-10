import {
  SlashCommandBuilder,
  UserSelectMenuBuilder,
  ActionRowBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('test')
  .setDescription('최근 경기를 조회합니다. (최대 20개)');

export async function execute(interaction) {
  try {
    const userSelect = new UserSelectMenuBuilder()
      .setCustomId('usersStatistics')
      .setPlaceholder('Select multiple users.')
      .setMinValues(1)
      .setMaxValues(10);

    const row1 = new ActionRowBuilder().addComponents(userSelect);

    await interaction.reply({
      content: 'Select users:',
      components: [row1],
    });
  } catch (err) {
    throw err;
  }
}
