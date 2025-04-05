import { Player } from '#databases/models/player.js';

async function findPlayerByDiscordId(discordId) {
  try {
    const player = await Player.findOne({ discordId });

    return player;
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

export { findPlayerByDiscordId, createPlayer };
