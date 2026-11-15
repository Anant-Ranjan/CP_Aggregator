import API from '../api';
import { BookmarkItem } from '../types';

interface Props {
  bookmarks: BookmarkItem[];
  onDeleted: () => void;
}

const BookmarkList = ({ bookmarks, onDeleted }: Props) => {
  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/bookmarks/${id}`);
      onDeleted();
    } catch (err) { console.error('Failed to delete bookmark:', err); }
  };

  if (!bookmarks.length) return <p className="text-gray-500 italic text-center py-4">No problems saved yet. Start building your repository!</p>;

  return (
    <div className="space-y-3">
      {bookmarks.map(bm => (
        <div key={bm._id} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 transition">
          <div>
            <a href={bm.problemLink} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:underline">{bm.problemName}</a>
            <div className="text-sm text-gray-500 mt-1 space-x-3">
              <span className="font-medium px-2 py-1 bg-gray-200 rounded">{bm.platform}</span>
              {bm.difficulty && <span>Difficulty: {bm.difficulty}</span>}
            </div>
          </div>
          <button onClick={() => handleDelete(bm._id)} className="text-red-500 hover:text-red-700 font-bold p-2" title="Delete Bookmark">✕</button>
        </div>
      ))}
    </div>
  );
};
export default BookmarkList;
