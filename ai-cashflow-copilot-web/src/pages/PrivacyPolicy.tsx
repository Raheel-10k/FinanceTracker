import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { ChevronLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="p-6 pt-12 space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-2xl font-semibold text-white">Privacy Policy</h1>
      </header>

      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-success">
            <Shield size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Our Commitment</h2>
          </div>
          <p className="text-sm text-secondaryText leading-relaxed">
            Your financial data is yours alone. AI Cashflow Survival Copilot is designed with a "privacy-first" architecture. We do not sell, trade, or rent your personal financial information to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">1. Data We Collect</h2>
          <Card className="space-y-3 p-5">
             <div className="flex gap-3">
                <FileText size={20} className="text-blue-400 shrink-0" />
                <div>
                   <h3 className="text-sm font-medium text-white">Bank Statements</h3>
                   <p className="text-xs text-secondaryText mt-1">We process PDF and CSV files you upload to extract transaction data for analysis.</p>
                </div>
             </div>
             <div className="flex gap-3">
                <Eye size={20} className="text-purple-400 shrink-0" />
                <div>
                   <h3 className="text-sm font-medium text-white">Usage Analytics</h3>
                   <p className="text-xs text-secondaryText mt-1">Minimal anonymous data to improve our AI's accuracy and app performance.</p>
                </div>
             </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">2. AI Processing</h2>
          <p className="text-sm text-secondaryText leading-relaxed">
            Our AI models process your transaction history to generate survival scores and guilt meters. This data is processed in a secure environment and is not used to train global models that could expose your private details.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">3. Data Security</h2>
          <Card className="bg-success/5 border-success/10 p-5 flex gap-4 items-start">
             <Lock size={24} className="text-success shrink-0" />
             <div>
                <h3 className="text-sm font-medium text-white">Military-Grade Encryption</h3>
                <p className="text-xs text-secondaryText mt-1">All data is encrypted at rest and in transit using industry-standard protocols.</p>
             </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">4. Your Rights</h2>
          <p className="text-sm text-secondaryText leading-relaxed">
            You have the absolute right to delete your data at any time. Using the "Wipe Data" feature in your profile will permanently remove all uploaded statements and history from our servers.
          </p>
        </section>
      </div>

      <footer className="text-center pt-10 text-xs text-secondaryText italic">
        Last updated: April 18, 2026
      </footer>
    </div>
  );
}
