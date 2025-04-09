import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema(
  {
    matchId: {
      type: String,
      required: true,
    },
    discordId: {
      type: String,
      required: true,
    },
    playerId: {
      type: String,
      required: true,
    },
    kill: {
      type: Number,
      default: 0,
    },
    damage: {
      type: Number,
      default: 0,
    },
    dbno: {
      type: Number,
      default: 0,
    },
    headshotKill: {
      type: Number,
      default: 0,
    },
    assists: {
      type: Number,
      default: 0,
    },
    boosts: {
      type: Number,
      default: 0,
    },
    heals: {
      type: Number,
      default: 0,
    },
    killPlace: {
      type: Number,
      default: 0,
    },
    killStreaks: {
      type: Number,
      default: 0,
    },
    longestKill: {
      type: Number,
      default: 0,
    },
    revives: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

statsSchema.index({ matchId: 1, playerId: 1 }, { unique: true });

export const Stats = mongoose.model('Stats', statsSchema);
