import { useAppStore } from '../store/useAppStore';
import { Navigate } from 'react-router-dom';
import Card from '../components/Card';
import StatTile from '../components/StatTile';

export default function Analysis() {
  const { report } = useAppStore();

  if (!report) return <Navigate to="/app" />;

  const summary = report.statementSummary;

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Full Analysis</h1>
        <p className="text-sm text-secondaryText">Based on your recent statement.</p>
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
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-secondaryText">Net retained</span>
            <span className="text-white font-medium">₹{summary.retainedBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-secondaryText">Transactions</span>
            <span className="text-white">{summary.txCount}</span>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white/90">Behavioral Insights</h2>
        <div className="grid gap-3">
          {report.insights.map((insight: string, idx: number) => (
            <Card key={idx}>
              <div className="flex items-start gap-3">
                <span className="text-white mt-1">✨</span>
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
