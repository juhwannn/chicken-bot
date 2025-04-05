const cache = {};
const cacheExpiry = {};
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30일

// 일정 간격으로 만료된 캐시 항목 제거
setInterval(() => {
  const currentTime = Date.now();
  for (const key in cacheExpiry) {
    if (cacheExpiry[key] <= currentTime) {
      delete cache[key];
      delete cacheExpiry[key];
      console.log(`캐시 만료: ${key}`);
    }
  }
}, CACHE_TTL);

export function setCache(key, value) {
  const currentTime = Date.now();
  cache[key] = value;
  cacheExpiry[key] = currentTime + CACHE_TTL; // 현재 시간에 TTL을 더하여 만료 시간 설정
}

export function getCache(key) {
  const currentTime = Date.now();
  if (cache[key] && cacheExpiry[key] > currentTime) {
    return cache[key];
  } else {
    // 데이터가 없거나 만료된 경우
    delete cache[key];
    delete cacheExpiry[key];
    return null;
  }
}
