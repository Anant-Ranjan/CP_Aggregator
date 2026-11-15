import redis from '../config/redisClient';

export async function updateLeaderboardScore(platform: string, member: string, score: number): Promise<void> {
  try {
    await redis.zadd(`leaderboard:${platform}`, score, member);
  } catch (err) {
    console.warn(`Redis zadd failed for leaderboard:${platform}:`, (err as Error).message);
  }
}

export async function getTopN(platform: string, n = 10): Promise<{ member: string; score: number }[]> {
  try {
    const raw = await redis.zrevrange(`leaderboard:${platform}`, 0, n - 1, 'WITHSCORES');
    const result: { member: string; score: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      result.push({
        member: raw[i],
        score: parseFloat(raw[i + 1]),
      });
    }
    return result;
  } catch (err) {
    console.warn(`Redis zrevrange failed for leaderboard:${platform}:`, (err as Error).message);
    return [];
  }
}

export async function getUserRank(platform: string, member: string): Promise<{ rank: number | null; score: number | null }> {
  try {
    const rank = await redis.zrevrank(`leaderboard:${platform}`, member);
    const score = await redis.zscore(`leaderboard:${platform}`, member);
    return {
      rank: rank !== null ? rank + 1 : null,
      score: score !== null ? parseFloat(score) : null,
    };
  } catch (err) {
    console.warn(`Redis rank/score failed for leaderboard:${platform}:`, (err as Error).message);
    return { rank: null, score: null };
  }
}
