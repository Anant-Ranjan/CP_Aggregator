import RatingChart from './RatingChart';
import { CodeforcesStats, LeetCodeStats, RatingHistoryEntry } from '../types';

interface StatCardProps {
  title: string;
  borderColor: string;
  titleColor: string;
  stats: CodeforcesStats | LeetCodeStats | null;
  renderContent: (stats: CodeforcesStats | LeetCodeStats) => React.ReactNode;
  historyData: RatingHistoryEntry[] | undefined;
}

const StatCard = ({ title, borderColor, titleColor, stats, renderContent, historyData }: StatCardProps) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border-t-4 ${borderColor} flex flex-col`}>
    <h2 className={`text-xl font-bold mb-4 ${titleColor}`}>{title}</h2>
    {stats ? (
      <div className="flex-1 flex flex-col">
        <div className="space-y-2">{renderContent(stats)}</div>
        <RatingChart historyData={historyData} />
      </div>
    ) : (
      <p className="text-gray-500 italic">No handle linked yet.</p>
    )}
  </div>
);
export default StatCard;
