export function calculateScore(p) {
  return (
    p.avgKill * 15 +
    p.avgDamage * 0.1 +
    p.avgDBNO * 10 +
    p.avgAssists * 8 +
    p.avgRevives * 5 +
    p.avgHeals * 1.5 +
    p.avgBoosts * 1 +
    p.avglongestKill * 0.05
  );
}

export function generateRankText(scoreList) {
  const sorted = [...scoreList].sort((a, b) => b.score - a.score);
  const medals = ['🥇', '🥈', '🥉', '💩'];
  const emojis = ['🔥', '💥', '💨', '🎯', '🎮', '🔫'];

  const quotes = [
    ['나 빼고 다 봇임 ㅋㅋ', '오늘 손 풀렸네 ㄹㅇ', '나 아직 본 실력 안 나옴'],
    ['이번 판은 손 풀기였음 ㄹㅇ', '운이 좀 안 따랐음;;', '근데 팀이 못했음'],
    ['나 진짜 이러다 감전됨', '컴퓨터가 문제임 이건', '눈 감고 했다'],
    ['다음 판부터 진짜 함', '이건 준비운동', '배율이 안 맞았음', '"보여줄게"'],
  ];

  const lines = sorted.map((player, i) => {
    const medal = medals[i] || `${i + 1}위:`;
    const emoji = emojis[i % emojis.length];
    const name = `**${player.pubgPlayerName}**`;
    const score = `${player.score.toFixed(1)}점`;
    const quotePool = quotes[i] || ['🔥 다음엔 터진다'];
    const quote = quotePool[Math.floor(Math.random() * quotePool.length)];

    return `${medal} ${i + 1}위: ${name} - ${score} ${emoji}\n> "${quote}"`;
  });

  return `🏆 **PUBG 전투 랭킹 결과** 🏆\n\n${lines.join(
    '\n\n'
  )}\n\n🎮 점수 기준: 평균 킬, 데미지, 기여도 등 종합 계산`;
}
