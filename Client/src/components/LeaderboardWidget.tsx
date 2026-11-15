import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { LeaderboardEntry } from '../types';

const LeaderboardWidget = () => {
  const [platform, setPlatform] = useState<'codeforces' | 'leetcode'>('codeforces');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    API.get(`/leaderboard?platform=${platform}&limit=5`)
      .then(r => setEntries(r.data.leaderboard))
      .catch(() => setEntries([]));
  }, [platform]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Leaderboard (Top 5)</h2>
        <div className="flex gap-2">
          <button onClick={() => setPlatform('codeforces')} className={`px-3 py-1 rounded text-sm font-bold ${platform === 'codeforces' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Codeforces</button>
          <button onClick={() => setPlatform('leetcode')} className={`px-3 py-1 rounded text-sm font-bold ${platform === 'leetcode' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>LeetCode</button>
        </div>
      </div>
      {entries.length === 0 ? (
        <p className="text-gray-500 italic text-sm">No leaderboard data yet. Load some profiles to populate it.</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((e, i) => (
            <li key={e.member} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono font-bold text-gray-500">#{i + 1}</span>
              <span className="font-semibold">{e.member}</span>
              <span className="font-bold text-green-700">{e.score}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-4 text-center">
        <Link to="/leaderboard" className="text-green-600 hover:underline text-sm font-semibold">View full leaderboard →</Link>
      </div>
    </div>
  );
};
export default LeaderboardWidget;
