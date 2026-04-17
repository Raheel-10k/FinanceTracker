import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      </header>

      <div className="space-y-4">
        <Card className="p-0 overflow-hidden divide-y divide-white/5">
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <span className="text-sm font-medium text-white">Dark Theme</span>
            <span className="text-secondaryText text-xs">Enabled</span>
          </button>
          
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <span className="text-sm font-medium text-white">Privacy Policy</span>
            <span className="text-secondaryText">→</span>
          </button>
        </Card>

        <Card className="p-0 overflow-hidden divide-y divide-white/5 border-danger/20">
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <span className="text-sm font-medium text-danger group-hover:text-red-400">Delete My Data</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
          >
            <span className="text-sm font-medium text-white group-hover:text-white/80">Logout</span>
          </button>
        </Card>
      </div>

      <div className="text-center pt-8">
        <p className="text-xs text-secondaryText">AI Cashflow Survival Copilot v1.0.0</p>
      </div>
    </div>
  );
}
