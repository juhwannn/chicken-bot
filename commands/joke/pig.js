const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('성재현').setDescription('???'),
  async execute(interaction) {
    await interaction.reply('돈갚아');
  },
};
