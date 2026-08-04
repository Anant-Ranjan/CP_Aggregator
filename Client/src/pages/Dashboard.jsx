import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingChart from '../components/RatingChart';
import API from '../api';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [handles, setHandles] = useState({ codeforcesHandle: '', leetcodeHandle: '' });

    const navigate = useNavigate();

    const [newBookmark, setNewBookmark] = useState({
        problemName: '',   // Changed from title
        problemLink: '',   // Changed from url
        platform: 'Codeforces', 
        difficulty: ''
    });

    const handleAddBookmark = async (e) => {
        e.preventDefault();
        try {
            await API.post('/bookmarks', newBookmark);
            
            setNewBookmark({ problemName: '', problemLink: '', platform: 'Codeforces', difficulty: '' });
            
            fetchDashboardData();
        } catch (err) {
            alert("Failed to add bookmark. Check the console.");
            console.error(err);
        }
    };

    const handleDeleteBookmark = async (id) => {
        try {
            await API.delete(`/bookmarks/${id}`);
            fetchDashboardData(); // Refresh the list
        } catch (err) {
            console.error("Failed to delete bookmark:", err);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const dashboardResponse = await API.get('/dashboard');
            const bookmarksResponse = await API.get('/bookmarks');
            setData({
                ...dashboardResponse.data,
                bookmarks: bookmarksResponse.data 
            });

            setHandles({
                codeforcesHandle: dashboardResponse.data.user.codeforcesHandle || '',
                leetcodeHandle: dashboardResponse.data.user.leetcodeHandle || ''
            });
            
            setLoading(false);
        } catch (err) {
            console.error(err);
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await API.put('/users/profile', handles);
            setIsEditing(false);
            fetchDashboardData(); 
        } catch (err) {
            alert("Failed to update profile");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-2xl font-bold text-gray-600">Aggregating Stats...</div>;
    }

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {data.user.username}</h1>
                    <p className="text-gray-500">{data.user.email}</p>
                </div>
                <div className="space-x-4">
                    <button onClick={() => setIsEditing(!isEditing)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition">
                        {isEditing ? "Cancel" : "Edit Handles"}
                    </button>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                        Logout
                    </button>
                </div>
            </div>

            {/* Profile Edit Form (Conditionally Rendered) */}
            {isEditing && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border-2 border-dashed border-gray-300">
                    <h2 className="text-xl font-bold mb-4">Link Platform Handles</h2>
                    <form onSubmit={handleUpdateProfile} className="flex gap-4">
                        <input 
                            type="text" 
                            placeholder="Codeforces Handle" 
                            value={handles.codeforcesHandle}
                            onChange={(e) => setHandles({...handles, codeforcesHandle: e.target.value})}
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input 
                            type="text" 
                            placeholder="LeetCode Handle" 
                            value={handles.leetcodeHandle}
                            onChange={(e) => setHandles({...handles, leetcodeHandle: e.target.value})}
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">
                            Save & Sync
                        </button>
                    </form>
                </div>
            )}

            {/* Stats Grid Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Codeforces Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 flex flex-col">
                    <h2 className="text-xl font-bold mb-4 text-blue-600">Codeforces</h2>
                    {data.codeforces ? (
                        <div className="flex-1 flex flex-col">
                            {/* Text Stats */}
                            <div className="space-y-2">
                                <p className="text-gray-700">Rating: <span className="font-bold text-lg">{data.codeforces.rating}</span></p>
                                <p className="text-gray-700">Rank: <span className="font-bold capitalize">{data.codeforces.rank}</span></p>
                            </div>
                            
                            {/* The New Rating Graph */}
                            <RatingChart historyData={data.codeforces.ratingHistory} />
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No handle linked yet.</p>
                    )}
                </div>

                {/* LeetCode Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-yellow-500 flex flex-col">
                    <h2 className="text-xl font-bold mb-4 text-yellow-600">LeetCode</h2>
                    {data.leetcode ? (
                        <div className="flex-1 flex flex-col">
                            {/* Text Stats */}
                            <div className="space-y-2">
                                <p className="text-gray-700">Total Solved: <span className="font-bold text-lg">{data.leetcode.totalSolved}</span></p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded">Easy: {data.leetcode.easy}</span>
                                    <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Med: {data.leetcode.medium}</span>
                                    <span className="text-red-600 bg-red-100 px-2 py-1 rounded">Hard: {data.leetcode.hard}</span>
                                </div>
                            </div>
                            
                            {/* Reusing the Rating Chart! */}
                            <RatingChart historyData={data.leetcode.ratingHistory} />
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No handle linked yet.</p>
                    )}
                </div>
            </div>
            {/* --- NEW SECTION: PROBLEM BOOKMARKS --- */}
            <div className="mt-10 bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-500">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">Saved Problems</h2>
                
                {/* Add Bookmark Form */}
                <form onSubmit={handleAddBookmark} className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-lg border">
                    <input 
                        type="text" required placeholder="Problem Name (e.g., Two Sum)"
                        value={newBookmark.problemName} 
                        onChange={(e) => setNewBookmark({...newBookmark, problemName: e.target.value})}
                        className="flex-1 min-w-[200px] p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input 
                        type="url" required placeholder="Problem Link"
                        value={newBookmark.problemLink}
                        onChange={(e) => setNewBookmark({...newBookmark, problemLink: e.target.value})}
                        className="flex-1 min-w-[200px] p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <select 
                        value={newBookmark.platform}
                        onChange={(e) => setNewBookmark({...newBookmark, platform: e.target.value})}
                        className="p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        <option value="Codeforces">Codeforces</option>
                        <option value="LeetCode">LeetCode</option>
                        <option value="Other">Other</option>
                    </select>
                    <input 
                        type="text" placeholder="Difficulty (e.g., Hard, 1500)"
                        value={newBookmark.difficulty}
                        onChange={(e) => setNewBookmark({...newBookmark, difficulty: e.target.value})}
                        className="w-32 p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-bold transition">
                        Save
                    </button>
                </form>

                {/* Bookmarks List */}
                <div className="space-y-3">
                    {data.bookmarks && data.bookmarks.length > 0 ? (
                        data.bookmarks.map((bookmark) => (
                            <div key={bookmark._id} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 transition">
                                <div>
                                    <a href={bookmark.problemLink} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:underline">
                                        {bookmark.problemName}
                                    </a>
                                    <div className="text-sm text-gray-500 mt-1 space-x-3">
                                        <span className="font-medium px-2 py-1 bg-gray-200 rounded">{bookmark.platform}</span>
                                        {bookmark.difficulty && <span>Difficulty: {bookmark.difficulty}</span>}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteBookmark(bookmark._id)}
                                    className="text-red-500 hover:text-red-700 font-bold p-2"
                                    title="Delete Bookmark"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic text-center py-4">No problems saved yet. Start building your repository!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;