import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RatingChart = ({ historyData }) => {
    if (!historyData || historyData.length === 0) {
        return <p className="text-gray-500 italic text-sm mt-4">Not enough contest history to display a graph.</p>;
    }

    return (
        <div className="w-full h-64 mt-6">
            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Rating Progression (Last 15 Contests)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    {/* Hide XAxis tick text because contest names are too long, but keep it in the tooltip */}
                    <XAxis dataKey="contestName" tick={false} axisLine={false} />
                    <YAxis 
                        domain={['dataMin - 50', 'dataMax + 50']} 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RatingChart;