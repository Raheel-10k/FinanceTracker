import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import StatTile from '../components/StatTile';
import GuiltMeter from '../components/GuiltMeter';

export default function Home() {
  const navigate = useNavigate();
  // Mock data for now
  const hasUploaded = true;

  if (!hasUploaded) {
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
          <button className="w-full h-12 bg-white text-black rounded-full font-medium active:scale-95 transition-transform">
            Select File
          </button>
          <button className="w-full text-sm text-secondaryText hover:text-white transition-colors">
            Try Demo Statement
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Good Evening, Rahul</h1>
        <p className="text-secondaryText text-sm mt-1">Your finances are stable this week.</p>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-secondaryText mb-1">Survival Score</h3>
            <p className="text-xs text-secondaryText">Based on runway & behavior</p>
          </div>
          <div className="w-16 h-16 rounded-full border-[4px] border-white flex items-center justify-center">
            <span className="text-xl font-semibold text-white">72</span>
          </div>
        </Card>

        <Card className="col-span-2">
          <GuiltMeter score={71} />
        </Card>

        <StatTile 
          title="Runway" 
          value="8 days" 
          subtitle="Until funds low" 
          valueColor="text-white"
        />
        <StatTile 
          title="Burn Rate" 
          value="₹540" 
          subtitle="per day" 
        />
        
        <StatTile 
          title="Micro Leaks" 
          value="₹4,860" 
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
