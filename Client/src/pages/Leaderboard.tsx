import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { LeaderboardEntry } from '../types';

const Leaderboard = () => {
  const [platform, setPlatform] = useState<'codeforces' | 'leetcode'>('codeforces');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`/leaderboard?platform=${platform}&limit=50`)
      .then(r => setEntries(r.data.leaderboard))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [platform]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🏆 Global Leaderboard</h1>
        <Link to="/" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-bold">← Back to Dashboard</Link>
      </div>

      {/* Platform toggle */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => setPlatform('codeforces')}
          className={`px-6 py-2 rounded-lg font-bold transition ${platform === 'codeforces' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
          Codeforces
        </button>
        <button onClick={() => setPlatform('leetcode')}
          className={`px-6 py-2 rounded-lg font-bold transition ${platform === 'leetcode' ? 'bg-yellow-500 text-white shadow-md' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
          LeetCode
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-500 italic">
          No leaderboard data yet. Users need to load their dashboard first to populate scores.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-bold text-gray-600">#</th>
                <th className="p-4 text-left font-bold text-gray-600">Username</th>
                <th className="p-4 text-right font-bold text-gray-600">{platform === 'codeforces' ? 'Rating' : 'Problems Solved'}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.member} className={`border-b hover:bg-gray-50 ${i < 3 ? 'bg-yellow-50' : ''}`}>
                  <td className="p-4 font-mono font-bold text-gray-500">{medals[i] || `#${i + 1}`}</td>
                  <td className="p-4 font-semibold text-gray-800">{e.member}</td>
                  <td className="p-4 text-right font-bold text-green-700">{e.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default Leaderboard;
