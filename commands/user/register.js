const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const playersFilePath = path.join(__dirname, '../../data/players.json');

const registerPlayer = async (interaction, pubgId, pubgServer) => {
  let players = {};
  if (fs.existsSync(playersFilePath)) {
    const data = fs.readFileSync(playersFilePath, 'utf8');
    players = JSON.parse(data);
  }

  const res = await fetch(
    `${process.env.PUBG_HOST}/${pubgServer}/players?filter[playerNames]=${pubgId}`,

    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
      },
    }
  );

  const playerData = await res.json();

  if (playerData.errors[0].title === 'Not Found') {
    await interaction.reply(`🚨 존재하지 않는 아이디입니다.`);

    return;
  }

  players[interaction?.user?.id] = {
    pubgPlayerName: playerData.data[0]?.attributes?.name,
    pubgPlayerId: playerData.data[0]?.id,
    playerAttributes: playerData.data[0].attributes,
    playerLinks: playerData.data[0].links,
    pubgServer,
    discordUser: { ...interaction?.user },
  };
  fs.writeFileSync(playersFilePath, JSON.stringify(players, null, 2), 'utf8');
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('등록')
    .setDescription('디스코드 아이디에 배틀그라운드 아이디를 등록합니다.')
    .addStringOption((option) =>
      option
        .setName('서버')
        .setDescription('배그 서버 선택')
        .setRequired(true)
        .addChoices(
          { name: '🟡 kakao', value: 'kakao' },
          { name: '🔵 steam', value: 'steam' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('아이디')
        .setDescription('당신의 배그 아이디')
        .setRequired(true)
    ),
  async execute(interaction) {
    const pubgId = interaction.options.getString('아이디');
    const pubgServer = interaction.options.getString('서버');

    if (!pubgId) {
      await interaction.reply('🚨 배틀그라운드 아이디를 입력해주세요.');
      return;
    }
    if (!pubgServer) {
      await interaction.reply('🚨 배틀그라운드 서버를 선택해주세요.');
      return;
    }

    registerPlayer(interaction, pubgId, pubgServer);

    await interaction.reply(
      `✅ ${interaction?.user?.username}님이 배틀그라운드 ${pubgServer}서버 아이디 ${pubgId}를 등록하셨습니다.`
    );
  },
};
