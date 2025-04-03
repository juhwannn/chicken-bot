const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const playersFilePath = path.join(__dirname, '../../data/players.json');

const getPlayer = (discordId) => {
  let player = {};
  if (fs.existsSync(playersFilePath)) {
    const data = fs.readFileSync(playersFilePath, 'utf8');
    player = JSON.parse(data);
  }
  return player[discordId];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('내정보')
    .setDescription(
      '디스코드 아이디에 등록된 배틀그라운드 아이디를 가져옵니다.'
    ),
  async execute(interaction) {
    const player = getPlayer(interaction.user.id);

    const embed = new EmbedBuilder()
      .addFields(
        { name: '👤 **디스코드**', value: player?.username, inline: false },
        { name: '🛡️ **서버**', value: player?.pubgServer, inline: false },
        {
          name: '🎮 **PUBG ID**',
          value: `\`${player?.pubgId}\``,
          inline: false,
        }
      )
      .setColor(0x00aeff)
      .setThumbnail(interaction.user.displayAvatarURL());

    await interaction.reply({
      embeds: [embed],
    });
  },
};
