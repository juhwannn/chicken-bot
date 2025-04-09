import { Player } from '#databases/models/player.js';

async function findPlayerByDiscordId(discordId) {
  try {
    const player = await Player.findOne({ discordId });

    return player;
  } catch (error) {
    throw error;
  }
}

async function findPlayerByDiscordIds(discordIds) {
  try {
    const players = await Player.find({ discordId: { $in: discordIds } });

    return players;
  } catch (error) {
    throw error;
  }
}

async function createPlayer(data = {}) {
  try {
    const player = new Player(data);

    await player.save();
  } catch (error) {
    throw error;
  }
}

async function getAllPlayers() {
  try {
    const players = await Player.find();

    return players;
  } catch (error) {
    throw error;
  }
}

export {
  findPlayerByDiscordId,
  findPlayerByDiscordIds,
  createPlayer,
  getAllPlayers,
};
