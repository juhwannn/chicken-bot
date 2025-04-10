import mongoose from 'mongoose';

/**
 * DBNOs	다운(DOWN) 시킨 횟수 (살아있는 적을 기절시킴)	0
 * assists	어시스트 횟수 (킬에 도움 준 경우)	0
 * boosts	부스트 아이템(에너지 드링크, 진통제 등) 사용 횟수	0
 * damageDealt	총 딜량 (적에게 준 데미지 총합)	0
 * deathType	죽은 방식 (byplayer, suicide 등)	"byplayer"
 * headshotKills	헤드샷으로 킬한 횟수	0
 * heals	회복 아이템 사용 횟수 (붕대, 응급처치 등)	0
 * killPlace	킬 순위 (많이 죽인 순서, 낮을수록 킬 많음)	99
 * killStreaks	연속 킬 횟수 (빠르게 연달아 킬한 수)	0
 * kills	킬 수 (직접 죽인 적의 수)	0
 * longestKill	가장 멀리서 킬한 거리 (단위: 미터)	0
 * name	플레이어 이름	"mynameispray"
 * playerId	PUBG에서의 고유 플레이어 ID	"account.xxxxx"
 * revives	아군을 부활시킨 횟수	0
 * rideDistance	차량으로 이동한 거리 (미터)	0
 * roadKills	차량으로 적을 친 횟수	0
 * swimDistance	수영으로 이동한 거리 (미터)	0
 * teamKills	팀킬 횟수 (같은 팀을 죽임)	0
 * timeSurvived	생존 시간 (초 단위)	107 초 = 약 1분 47초
 * vehicleDestroys	차량 파괴 횟수	0
 * walkDistance	걸은 거리 (미터)	9.801682
 * weaponsAcquired	무기 획득 수	1
 * winPlace	최종 순위 (낮을수록 좋은 등수)	28위
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
    teamKills: {
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
