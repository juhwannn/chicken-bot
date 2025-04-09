import mongoose from 'mongoose';

/*
  DBNOs: 0,
  assists: 0,
  boosts: 0,
  damageDealt: 399.99997,
  headshotKills: 0,
  heals: 0,
  killPlace: 1,
  killStreaks: 1,
  kills: 2,
  longestKill: 18.25155,
  name: 'p_rimary',
  playerId: 'account.2621f8f1c520476bb232fab8a9fcf31e',
  revives: 0,
  rideDistance: 0,
  roadKills: 0,
  teamKills: 0,
  timeSurvived: 82,
  vehicleDestroys: 0,
*/
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
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

export const Stats = mongoose.model('Stats', statsSchema);
