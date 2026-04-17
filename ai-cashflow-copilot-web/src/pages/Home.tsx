import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import StatTile from '../components/StatTile';
import GuiltMeter from '../components/GuiltMeter';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function Home() {
  const navigate = useNavigate();
  const { report, setReport, token } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return navigate('/login');
    const fetchLatest = async () => {
      try {
        const res = await api.get('/dashboard/latest');
        setReport(res.data.report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bankName', 'Default');

    try {
      await api.post('/statement/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const res = await api.get('/dashboard/latest');
      setReport(res.data.report);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload statement');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-6 pt-12 flex items-center justify-center h-full">Loading...</div>;

  if (!report) {
    return (
      <div className="p-6 pt-12 flex flex-col items-center justify-center h-full">
        <Card className="w-full max-w-sm text-center py-10 space-y-6">
          <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Upload Bank Statement</h2>
            <p className="text-sm text-secondaryText">PDF or CSV supported.</p>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <label className="w-full h-12 bg-white text-black rounded-full font-medium active:scale-95 transition-transform flex items-center justify-center cursor-pointer">
            {uploading ? 'Processing...' : 'Select File'}
            <input type="file" className="hidden" accept=".pdf,.csv" onChange={handleFileUpload} disabled={uploading}/>
          </label>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-semibold">Good Evening</h1>
             <label className="text-xs px-3 py-1 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
                New
                <input type="file" className="hidden" accept=".pdf,.csv" onChange={handleFileUpload} disabled={uploading}/>
             </label>
        </div>
        <p className="text-secondaryText text-sm mt-1">{report.aiNarrative || "Your finances are stable this week."}</p>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-secondaryText mb-1">Survival Score</h3>
            <p className="text-xs text-secondaryText">Based on runway & behavior</p>
            <p className={`text-[11px] mt-1.5 font-medium ${report.survivalScore > 75 ? 'text-success' : report.survivalScore < 40 ? 'text-danger' : 'text-blue-400'}`}>
              {report.survivalScore > 75 ? 'Looking highly stable 🚀' : report.survivalScore < 40 ? 'Severe risk detected ⚠️' : 'Pacing moderately well'}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-[4px] border-white flex items-center justify-center relative shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span className="text-xl font-semibold text-white">{report.survivalScore}</span>
          </div>
        </Card>

        <Card className="col-span-2">
          <GuiltMeter score={report.guiltScore} />
          <p className="text-xs text-secondaryText mt-3">{report.guiltLabel}</p>
        </Card>

        <StatTile 
          title="Runway" 
          value={`${Math.floor((new Date(report.runwayDate).getTime() - Date.now()) / 86400000)} d`} 
          subtitle="Until funds low" 
          valueColor="text-white"
        />
        <StatTile 
          title="Burn Rate" 
          value={`₹${report.burnRate}`} 
          subtitle="per day" 
        />
        
        <StatTile 
          title="Micro Leaks" 
          value={`₹${report.microLeakAmount}`} 
          subtitle="small spends" 
          className="col-span-2"
        />
      </div>

      <button 
        onClick={() => navigate('/app/analysis')}
        className="w-full h-14 rounded-2xl bg-white/5 text-white border border-white/10 font-medium active:scale-95 transition-transform mt-4"
      >
        View Full Analysis
      </button>
    </div>
  );
}
