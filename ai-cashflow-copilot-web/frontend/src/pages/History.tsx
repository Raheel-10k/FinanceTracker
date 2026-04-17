import { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../services/api';

export default function History() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/history');
        setHistoryData(res.data.reports || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-6 pt-12">Loading history...</div>;

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-1">History</h1>
        <p className="text-sm text-secondaryText">Past statement analyses.</p>
      </header>

      <div className="space-y-4">
        {historyData.length === 0 && <p className="text-secondaryText">No history found.</p>}
        {historyData.map((item, i) => (
          <Card key={i} className="flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-medium text-white">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium tracking-wider
                ${item.survivalScore > 75 ? 'bg-success/20 text-success' : 
                  item.survivalScore < 50 ? 'bg-danger/20 text-danger' : 
                  'bg-white/10 text-white/70'}`}
              >
                {item.survivalScore > 75 ? 'Improving' : 'Attention'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div>
                <p className="text-[10px] text-secondaryText uppercase mb-1">Score</p>
                <p className="font-semibold text-white">{item.survivalScore}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondaryText uppercase mb-1">Guilt</p>
                <p className="font-semibold text-white">{item.guiltScore}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondaryText uppercase mb-1">Runway</p>
                <p className="font-semibold text-white">{Math.floor((new Date(item.runwayDate).getTime() - Date.now()) / 86400000)}s</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
