import { useState } from 'react';
import Card from '../components/Card';
import GuiltMeter from '../components/GuiltMeter';

export default function Simulator() {
  const [reduceSpend, setReduceSpend] = useState(100);
  const [extraIncome, setExtraIncome] = useState(0);

  // Mock calculation
  const newRunway = 8 + Math.floor(reduceSpend / 50) + Math.floor(extraIncome / 1000);
  const newScore = Math.min(100, 72 + Math.floor(reduceSpend / 20));
  const newGuilt = Math.max(0, 71 - Math.floor(reduceSpend / 10));
  const projectedBalance = 6200 + (reduceSpend * 30) + extraIncome;

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Simulator</h1>
        <p className="text-sm text-secondaryText">See how small changes impact your cycle.</p>
      </header>

      <div className="space-y-6">
        <div>
          <label className="flex justify-between text-sm mb-3 text-secondaryText">
            <span>Reduce daily spend by</span>
            <span className="text-white font-medium">₹{reduceSpend}</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="1000" 
            step="50"
            value={reduceSpend} 
            onChange={e => setReduceSpend(Number(e.target.value))}
            className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
           <label className="flex justify-between text-sm mb-3 text-secondaryText">
            <span>Extra Income</span>
            <span className="text-white font-medium">₹{extraIncome}</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="10000" 
            step="500"
            value={extraIncome} 
            onChange={e => setExtraIncome(Number(e.target.value))}
            className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <Card className="mt-8 bg-cardHover border-white/10">
          <h3 className="text-sm font-medium mb-4">Projected Results</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-secondaryText text-sm">New Runway</span>
              <span className="text-xl font-semibold text-white">{newRunway} days</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-secondaryText text-sm">New Score</span>
              <span className="text-xl font-semibold">{newScore}/100</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-secondaryText text-sm">Proj. Balance</span>
              <span className="text-xl font-semibold text-success">₹{projectedBalance.toLocaleString()}</span>
            </div>

            <div className="pt-2">
              <GuiltMeter score={newGuilt} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
