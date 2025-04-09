import dotenv from 'dotenv';
import cron from 'node-cron';
import mongoose from 'mongoose';
import { getAllPlayers } from '#databases/repositories/player.js';

dotenv.config();

const fetchAndStoreMatches = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'chickenbot' });

    const players = await getAllPlayers();

    for (const player of players) {
      const filterString = players
        .map((player) => player.pubgPlayerId)
        .join(',');

      const res = await fetch(
        `https://api.pubg.com/shards/${player.pubgServer}/players?filter[playerIds]=${filterString}`,
        {
          headers: {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
          },
        }
      );

      const data = await res.json();

      for (const player of data.data) {
        console.log(' player =======> ', player.relationships.matches.data);
      }

      // 여기에 경기 데이터를 DB에 저장하는 로직을 추가하세요.
    }
  } catch (error) {
    console.error('Error fetching and storing matches:', error);
  }
};

// 매일 자정에 실행되는 작업
cron.schedule('0 0 * * *', async () => {
  try {
    await fetchAndStoreMatches();
  } catch (error) {
    console.error('Error during scheduled task:', error);
  }
});

await fetchAndStoreMatches();
