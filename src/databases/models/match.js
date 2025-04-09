import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  pubgPlayerName: { type: String, required: true },
  pubgPlayerId: { type: String, required: true },
  matchId: { type: String, required: true, unique: true },
});

export const Match = mongoose.model('Match', matchSchema);
