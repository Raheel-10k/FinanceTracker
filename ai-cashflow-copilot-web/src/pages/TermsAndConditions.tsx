import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { ChevronLeft, Info, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="p-6 pt-12 space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-2xl font-semibold text-white">Terms of Service</h1>
      </header>

      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Info size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Introduction</h2>
          </div>
          <p className="text-sm text-secondaryText leading-relaxed">
            By using AI Cashflow Survival Copilot, you agree to these terms. Please read them carefully to understand how our service works and the limitations of AI-driven financial insights.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">1. Not Financial Advice</h2>
          <Card className="border-danger/20 bg-danger/5 p-5 flex gap-4 items-start">
             <AlertTriangle size={24} className="text-danger shrink-0" />
             <div className="text-sm text-secondaryText leading-relaxed">
                <span className="font-bold text-white block mb-1">DISCLAIMER:</span>
                The Survival Score, Guilt Meter, and AI narratives provided by this app are for informational purposes only. They do not constitute professional financial, investment, or legal advice.
             </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">2. User Responsibility</h2>
          <p className="text-sm text-secondaryText leading-relaxed">
            You are responsible for the accuracy of the bank statements you upload. Our AI reflects the data provided. Inaccurate statement uploads will lead to inaccurate projections.
          </p>
          <ul className="space-y-2">
             <li className="flex gap-2 items-center text-xs text-secondaryText">
                <CheckCircle size={14} className="text-success" />
                You must have legal access to the statements you upload.
             </li>
             <li className="flex gap-2 items-center text-xs text-secondaryText">
                <CheckCircle size={14} className="text-success" />
                You must maintain the security of your account credentials.
             </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">3. Limitations of AI</h2>
          <p className="text-sm text-secondaryText leading-relaxed">
            While we strive for 99% accuracy in transaction parsing, bank statement formats vary. The "Survival Score" is a heuristic projection and not a guarantee of future cashflow stability.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">4. Fair Use</h2>
          <p className="text-sm text-secondaryText leading-relaxed">
            We reserve the right to suspend accounts that attempt to manipulate the system or upload corrupted files designed to exploit the AI parsing pipeline.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-secondaryText">
             <Scale size={18} />
             <h2 className="text-sm font-semibold uppercase tracking-wider">Governing Law</h2>
          </div>
          <p className="text-sm text-secondaryText leading-relaxed">
            These terms are governed by the laws of your local jurisdiction and any disputes will be resolved through standard arbitration.
          </p>
        </section>
      </div>

      <footer className="text-center pt-10 text-xs text-secondaryText italic">
        Last updated: April 18, 2026
      </footer>
    </div>
  );
}
