import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  pubgPlayerName: { type: String, required: true },
  pubgPlayerId: { type: String, required: true },
  playerAttributes: {
    name: String,
    stats: mongoose.Schema.Types.Mixed,
    titleId: String,
    shardId: String,
    patchVersion: String,
    banType: String,
    clanId: String,
  },
  playerLinks: {
    self: String,
    schema: String,
  },
  pubgServer: { type: String, required: true },
  discordUser: {
    id: String,
    bot: Boolean,
    system: Boolean,
    flags: Number,
    username: String,
    globalName: String,
    discriminator: String,
    avatar: String,
    avatarDecoration: mongoose.Schema.Types.Mixed,
  },
});

export const Player = mongoose.model('Player', playerSchema);
