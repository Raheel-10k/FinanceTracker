import Card from '../components/Card';
import StatTile from '../components/StatTile';

export default function Analysis() {
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
            <span className="text-success font-medium">₹42,000</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-secondaryText">Total debits (Outflow)</span>
            <span className="text-danger font-medium">₹36,500</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-secondaryText">Net retained</span>
            <span className="text-white font-medium">₹5,500</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-secondaryText">Transactions</span>
            <span className="text-white">118</span>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white/90">Behavioral Insights</h2>
        <div className="grid gap-3">
          <Card>
            <div className="flex items-start gap-3">
              <span className="text-amber-500 mt-1">⚠️</span>
              <div>
                <h4 className="font-medium text-sm text-white mb-1">First Week Burn</h4>
                <p className="text-xs text-secondaryText">41% of your funds were spent in the first 7 days of the cycle. Consider pacing your discretionary spends.</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">💡</span>
              <div>
                <h4 className="font-medium text-sm text-white mb-1">Micro Leaks Detected</h4>
                <p className="text-xs text-secondaryText">You have ₹4,860 in spends under ₹200. These add up quickly and drain liquidity.</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="text-white mt-1">🔄</span>
              <div>
                <h4 className="font-medium text-sm text-white mb-1">Money Cycle</h4>
                <p className="text-xs text-secondaryText">Average income arrives every 29 days. Funds usually tighten in the final 5 days.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

    </div>
  );
}
