import { useAppStore } from '../store/useAppStore';
import { Navigate } from 'react-router-dom';
import Card from '../components/Card';

export default function Analysis() {
  const { report } = useAppStore();

  if (!report) return <Navigate to="/app" />;

  const summary = report.statementSummary;
  
  const getRelevantEmoji = (insight: string) => {
    const text = insight.toLowerCase();
    if (text.includes('burn') || text.includes('deplete') || text.includes('month')) return '🔥';
    if (text.includes('micro') || text.includes('leaks') || text.includes('draining')) return '💧';
    if (text.includes('largest') || text.includes('represents') || text.includes('%')) return '💰';
    if (text.includes('stable') || text.includes('pacy') || text.includes('good')) return '✅';
    return '✨';
  };

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Full Analysis</h1>
        <p className="text-sm text-secondaryText">Based on your consolidated transaction history.</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white/90">Statement Summary</h2>
        <Card className="space-y-3">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-secondaryText">Total credits (Inflow)</span>
            <span className="text-success font-medium">₹{summary.totalCredits.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-secondaryText">Total debits (Outflow)</span>
            <span className="text-danger font-medium">₹{summary.totalDebits.toLocaleString()}</span>
          </div>

          <div className="flex justify-between pt-1 pb-2 border-b border-white/5">
            <span className="text-secondaryText">Retained Balance</span>
            <span className={`font-medium ${summary.retainedBalance >= 0 ? 'text-success' : 'text-danger'}`}>
              ₹{summary.retainedBalance.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between pt-1 pb-2 border-b border-white/5">
            <span className="text-secondaryText">Largest Single Spend</span>
            <span className="text-white">₹{summary.largestSpend.toLocaleString()}</span>
          </div>

          <div className="flex justify-between pt-1 pb-2 border-b border-white/5">
            <span className="text-secondaryText">Transactions</span>
            <span className="text-white">{summary.txCount}</span>
          </div>

          <div className="pt-2 border-t border-white/5 mt-2">
            <div className="flex justify-between items-baseline mb-1">
               <span className="text-secondaryText text-xs uppercase tracking-wider">Burn Rate Analysis</span>
               <span className="text-white font-medium">₹{summary.averageDailySpend} <span className="text-[10px] text-secondaryText">/ day</span></span>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed italic">
               Calculated as Total Outflow (₹{summary.totalDebits.toLocaleString()}) divided by the statement duration of {summary.actualDaysSpanned} days.
            </p>
          </div>
        </Card>
      </section>

      {report.microLeakTransactions && report.microLeakTransactions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white/90">Identified Micro Leaks</h2>
          <Card className="divide-y divide-white/5 space-y-2 max-h-64 overflow-y-auto">
            {report.microLeakTransactions.map((tx: any, idx: number) => (
              <div key={idx} className="group relative flex justify-between items-center pt-2 pb-2 cursor-pointer">
                 <span className="text-sm text-secondaryText truncate max-w-[200px] transition-colors group-hover:text-white">{tx.description || "Vendor"}</span>
                 <span className="text-sm text-danger font-medium">-₹{tx.amount}</span>
                 
                 <div className="absolute top-8 left-0 hidden group-hover:flex bg-card border border-white/10 text-secondaryText text-[11px] p-2 rounded z-10 w-[95%] shadow-lg">
                    {tx.hoverMessage || "Was this spend entirely necessary?"}
                 </div>
              </div>
            ))}
          </Card>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white/90">Behavioral Insights</h2>
        <div className="grid gap-3">
          {report.insights.map((insight: string, idx: number) => (
            <Card key={idx}>
              <div className="flex items-start gap-3">
                <span className="text-white mt-1">{getRelevantEmoji(insight)}</span>
                <div>
                  <p className="text-sm text-white/90">{insight}</p>
                </div>
              </div>
            </Card>
          ))}
          <Card>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">💡</span>
              <div>
                 <h4 className="font-medium text-sm text-white mb-1">Recommendation</h4>
                <p className="text-sm text-white/90">{report.simulatorAdvice}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
