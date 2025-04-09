module.exports = {
  apps: [
    {
      name: 'chicken-bot', // 애플리케이션 이름
      script: './server.js', // 실행할 메인 파일
      instances: 1, // 클러스터 모드 사용 시 프로세스 수 (1은 싱글 인스턴스)
      autorestart: true, // 애플리케이션이 종료되면 자동 재시작
      watch: false, // 파일 변경 감지 (프로덕션에서는 false 권장)
      max_memory_restart: '300M', // 메모리 사용량이 300MB를 초과하면 재시작
      env: {
        NODE_ENV: 'production', // 프로덕션 환경 변수
        MONGO_URL: process.env.MONGO_URL, // MongoDB URL
        DISCORD_TOKEN: process.env.DISCORD_TOKEN, // Discord 봇 토큰
        CLIENT_ID: process.env.CLIENT_ID, // Discord 클라이언트 ID
        GUILD_ID: process.env.GUILD_ID, // Discord 서버 ID
        PUBG_API_KEY: process.env.PUBG_API_KEY, // PUBG API 키
        PUBG_HOST: process.env.PUBG_HOST, // PUBG API 호스트
      },
    },
  ],
};
