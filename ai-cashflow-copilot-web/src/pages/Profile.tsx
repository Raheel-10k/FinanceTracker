import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/Card';
import api from '../services/api';
import { User, LogOut, Shield, ChevronRight, HelpCircle } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setToken, setUser, report } = useAppStore();

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const handleDeleteData = async () => {
    if(confirm("Are you sure you want to delete all uploaded statements and history?")) {
        try {
            await api.delete('/user/data');
            alert('Data deleted successfully');
            window.location.reload();
        } catch(e) {
            alert('Failed to delete data');
        }
    }
  };

  return (
    <div className="p-6 pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-full mx-auto flex items-center justify-center p-1 border border-white/10">
          <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
             <User size={40} className="text-white/80" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">{user?.email.split('@')[0]}</h1>
          <p className="text-sm text-secondaryText">{user?.email}</p>
        </div>
      </header>

      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <Card className="text-center p-4">
              <p className="text-[10px] uppercase tracking-wider text-secondaryText mb-1">Status</p>
              <p className="text-sm font-medium text-success">Active Member</p>
           </Card>
           <Card className="text-center p-4">
              <p className="text-[10px] uppercase tracking-wider text-secondaryText mb-1">Reports</p>
              <p className="text-sm font-medium text-white">{report ? 'Analyzed' : 'No Data'}</p>
           </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-secondaryText uppercase tracking-widest px-1">Preferences</h2>
        <Card className="p-0 overflow-hidden divide-y divide-white/5">
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <span className="text-sm font-medium text-white">Dark Mode</span>
            <span className="text-secondaryText text-xs font-medium">Automatic</span>
          </button>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-secondaryText uppercase tracking-widest px-1">Legal & Support</h2>
        <Card className="p-0 overflow-hidden divide-y divide-white/5">
          <button 
            onClick={() => navigate('/app/privacy')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div className="flex items-center gap-3">
               <Shield size={18} className="text-secondaryText group-hover:text-white transition-colors" />
               <span className="text-sm font-medium text-white">Privacy Policy</span>
            </div>
            <ChevronRight size={16} className="text-secondaryText" />
          </button>
          
          <button 
            onClick={() => navigate('/app/terms')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div className="flex items-center gap-3">
               <HelpCircle size={18} className="text-secondaryText group-hover:text-white transition-colors" />
               <span className="text-sm font-medium text-white">Terms of Service</span>
            </div>
            <ChevronRight size={16} className="text-secondaryText" />
          </button>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-danger uppercase tracking-widest px-1">Danger Zone</h2>
        <Card className="p-0 overflow-hidden border-danger/20">
          <button 
             onClick={handleDeleteData}
             className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-500/[0.02] transition-colors group">
            <span className="text-sm font-medium text-danger group-hover:text-red-400">Wipe Data & History</span>
            <ChevronRight size={16} className="text-danger opacity-50" />
          </button>
        </Card>
      </section>

      <section className="pt-4">
        <button 
          onClick={handleLogout}
          className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 group transition-all"
        >
          <LogOut size={18} className="text-secondaryText group-hover:text-white" />
          <span className="text-sm font-semibold text-white">Logout</span>
        </button>
      </section>

      <div className="text-center pt-8">
        <p className="text-[11px] text-secondaryText font-medium">AI Copilot v1.0.0</p>
        <p className="text-[9px] text-secondaryText uppercase tracking-widest opacity-30 mt-1">End-to-End Encrypted</p>
      </div>
    </div>
  );
}
