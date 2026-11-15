import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { DashboardResponse, BookmarkItem, CodeforcesStats, LeetCodeStats } from '../types';
import StatCard from '../components/StatCard';
import BookmarkForm from '../components/BookmarkForm';
import BookmarkList from '../components/BookmarkList';
import LeaderboardWidget from '../components/LeaderboardWidget';

const Dashboard = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [handles, setHandles] = useState({ codeforcesHandle: '', leetcodeHandle: '' });
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // PARALLEL fetch — both fire at the same time
      const [dashboardResponse, bookmarksResponse] = await Promise.all([
        API.get('/dashboard'),
        API.get('/bookmarks'),
      ]);
      setData(dashboardResponse.data);
      setBookmarks(bookmarksResponse.data);
      setHandles({
        codeforcesHandle: dashboardResponse.data.user.codeforcesHandle || '',
        leetcodeHandle: dashboardResponse.data.user.leetcodeHandle || '',
      });
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put('/users/profile', handles);
      setIsEditing(false);
      fetchDashboardData();
    } catch { alert('Failed to update profile'); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-2xl font-bold text-gray-600">Aggregating Stats...</div>;
  if (!data) return null;

  const cfStats = data.codeforces as CodeforcesStats | null;
  const lcStats = data.leetcode as LeetCodeStats | null;

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {data.user.username}</h1>
          <p className="text-gray-500">{data.user.email}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/leaderboard" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition font-bold">🏆 Leaderboard</Link>
          <button onClick={() => setIsEditing(!isEditing)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition">{isEditing ? 'Cancel' : 'Edit Handles'}</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Logout</button>
        </div>
      </div>

      {/* Edit handles form */}
      {isEditing && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-bold mb-4">Link Platform Handles</h2>
          <form onSubmit={handleUpdateProfile} className="flex gap-4">
            <input type="text" placeholder="Codeforces Handle" value={handles.codeforcesHandle}
              onChange={e => setHandles({ ...handles, codeforcesHandle: e.target.value })}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="LeetCode Handle" value={handles.leetcodeHandle}
              onChange={e => setHandles({ ...handles, leetcodeHandle: e.target.value })}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">Save & Sync</button>
          </form>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Codeforces" borderColor="border-blue-500" titleColor="text-blue-600"
          stats={cfStats} historyData={cfStats?.ratingHistory}
          renderContent={(s) => { const cf = s as CodeforcesStats; return (<><p className="text-gray-700">Rating: <span className="font-bold text-lg">{cf.rating}</span></p><p className="text-gray-700">Rank: <span className="font-bold capitalize">{cf.rank}</span></p></>); }}
        />
        <StatCard
          title="LeetCode" borderColor="border-yellow-500" titleColor="text-yellow-600"
          stats={lcStats} historyData={lcStats?.ratingHistory}
          renderContent={(s) => { const lc = s as LeetCodeStats; return (<><p className="text-gray-700">Total Solved: <span className="font-bold text-lg">{lc.problemsSolved.all}</span></p><div className="flex gap-4 mt-2 text-sm"><span className="text-green-600 bg-green-100 px-2 py-1 rounded">Easy: {lc.problemsSolved.easy}</span><span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Med: {lc.problemsSolved.medium}</span><span className="text-red-600 bg-red-100 px-2 py-1 rounded">Hard: {lc.problemsSolved.hard}</span></div></>); }}
        />
      </div>

      {/* Leaderboard Widget */}
      <LeaderboardWidget />

      {/* Bookmarks */}
      <div className="mt-10 bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-500">
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Saved Problems</h2>
        <BookmarkForm onAdded={fetchDashboardData} />
        <BookmarkList bookmarks={bookmarks} onDeleted={fetchDashboardData} />
      </div>
    </div>
  );
};
export default Dashboard;
