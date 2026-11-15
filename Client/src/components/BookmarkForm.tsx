import { useState } from 'react';
import API from '../api';

interface Props {
  onAdded: () => void;
}

const BookmarkForm = ({ onAdded }: Props) => {
  const [form, setForm] = useState({ problemName: '', problemLink: '', platform: 'Codeforces', difficulty: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/bookmarks', form);
      setForm({ problemName: '', problemLink: '', platform: 'Codeforces', difficulty: '' });
      onAdded();
    } catch (err) {
      alert('Failed to add bookmark.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-lg border">
      <input type="text" required placeholder="Problem Name (e.g., Two Sum)" value={form.problemName}
        onChange={e => setForm({ ...form, problemName: e.target.value })}
        className="flex-1 min-w-[200px] p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none" />
      <input type="url" required placeholder="Problem Link" value={form.problemLink}
        onChange={e => setForm({ ...form, problemLink: e.target.value })}
        className="flex-1 min-w-[200px] p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none" />
      <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
        className="p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none">
        <option value="Codeforces">Codeforces</option>
        <option value="LeetCode">LeetCode</option>
        <option value="Other">Other</option>
      </select>
      <input type="text" placeholder="Difficulty (e.g., Hard, 1500)" value={form.difficulty}
        onChange={e => setForm({ ...form, difficulty: e.target.value })}
        className="w-32 p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none" />
      <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-bold transition">Save</button>
    </form>
  );
};
export default BookmarkForm;
