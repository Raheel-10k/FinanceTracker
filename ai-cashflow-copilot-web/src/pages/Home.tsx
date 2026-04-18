import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import StatTile from '../components/StatTile';
import GuiltMeter from '../components/GuiltMeter';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const { report, setReport, token } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

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
    
    const statusMessages = [
      'Reading statement data...',
      'Parsing transactions...',
      'Filtering duplicate entries...',
      'Merging with historical data...',
      'Generating survival insights...',
      'Finalizing AI report...'
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
       if (msgIndex < statusMessages.length - 1) {
          msgIndex++;
          setUploadStatus(statusMessages[msgIndex]);
       }
    }, 1500);

    setUploadStatus(statusMessages[0]);

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
      clearInterval(interval);
      setUploading(false);
      setUploadStatus('');
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

        {/* CRED-like Loader Overlay */}
        {uploading && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="fixed inset-0 bg-[#070707] z-[100] flex flex-col items-center justify-center p-8 overflow-hidden"
           >
             {/* Background Gradients */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
             
             {/* Spinner Section */}
             <div className="relative w-32 h-32 mb-16">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-white/5 border-b-white/20 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
                </div>
             </div>

             <div className="space-y-6 text-center max-w-xs relative z-10">
                <div className="flex flex-col items-center">
                   <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-500/60 font-bold mb-3">System Scanning</span>
                   <div className="h-6 overflow-hidden relative w-full">
                      <AnimatePresence mode="wait">
                        <motion.h2 
                          key={uploadStatus}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="text-lg font-medium text-white"
                        >
                          {uploadStatus}
                        </motion.h2>
                      </AnimatePresence>
                   </div>
                </div>
                
                <p className="text-secondaryText text-[12px] leading-relaxed font-light opacity-60">
                   Compiling your financial signature through automated AI analysis.
                </p>
             </div>

             <div className="absolute bottom-12 text-[9px] uppercase tracking-[0.4em] text-white/20 font-medium">
                Encrypted Session
             </div>
           </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-semibold">{greeting}</h1>
             <label className="text-xs px-3 py-1 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-2">
                {uploading ? <div className="w-2 h-2 bg-white rounded-full animate-ping"></div> : 'New'}
                <input type="file" className="hidden" accept=".pdf,.csv" onChange={handleFileUpload} disabled={uploading}/>
             </label>
        </div>
        <div className="mt-4 p-4 rounded-r-2xl bg-white/[0.02] border-l-2 border-white/10 hover:border-emerald-500/50 hover:bg-white/[0.03] transition-all duration-500 group cursor-default">
          <p className="text-[13px] leading-relaxed text-secondaryText italic group-hover:text-white/90 transition-colors duration-500">
            "{report.aiNarrative || "Your spending patterns indicate a high survival rate this cycle. Keep pacy."}"
          </p>
        </div>
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
        className="group relative w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 font-semibold active:scale-95 transition-all duration-300 mt-4 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/40 hover:from-emerald-500/15 overflow-hidden"
      >
        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-25 animate-comet pointer-events-none" />
        <span className="relative z-10">View Full Analysis</span>
      </button>

      {/* CRED-like Loader Overlay */}
      {uploading && (
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="fixed inset-0 bg-[#070707] z-[100] flex flex-col items-center justify-center p-8 overflow-hidden"
         >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
           
           <div className="relative w-32 h-32 mb-16">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-white/5 border-b-white/20 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
              </div>
           </div>

           <div className="space-y-6 text-center max-w-xs relative z-10">
              <div className="flex flex-col items-center">
                 <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-500/60 font-bold mb-3">System Scanning</span>
                 <div className="h-6 overflow-hidden relative w-full">
                    <AnimatePresence mode="wait">
                      <motion.h2 
                        key={uploadStatus}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-lg font-medium text-white"
                      >
                        {uploadStatus}
                      </motion.h2>
                    </AnimatePresence>
                 </div>
              </div>
              
              <p className="text-secondaryText text-[12px] leading-relaxed font-light opacity-60">
                 Compiling your financial signature through automated AI analysis.
              </p>
           </div>

           <div className="absolute bottom-12 text-[9px] uppercase tracking-[0.4em] text-white/20 font-medium">
              Encrypted Session
           </div>
         </motion.div>
      )}
    </div>
  );
}
