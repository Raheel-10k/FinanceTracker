import { useAppStore } from '../store/useAppStore';
import { Navigate } from 'react-router-dom';
import Card from '../components/Card';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function Analysis() {
  const { report, setReport } = useAppStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategorize = async (description: string, category: string, amountValue: number, dateValue: Date, sourceCategoryId: string) => {
    try {
      await api.post('/user/rules', { descriptionPattern: description, category });
      
      // Local UI Optimistic Update (Bulk Move)
      if (report) {
        const updatedReport = JSON.parse(JSON.stringify(report));
        const sourceCat = updatedReport.categoryTotals[sourceCategoryId];
        const targetCat = updatedReport.categoryTotals[category];

        // Find all matching transactions in the current source category
        const matchingTxs = sourceCat.transactions.filter((t: any) => 
          t.description.toUpperCase().includes(description.toUpperCase())
        );

        if (matchingTxs.length > 0) {
          // 1. Remove all matching from source
          sourceCat.transactions = sourceCat.transactions.filter((t: any) => 
            !t.description.toUpperCase().includes(description.toUpperCase())
          );
          
          const totalAmountMoved = matchingTxs.reduce((sum: number, t: any) => sum + t.amount, 0);
          sourceCat.total -= totalAmountMoved;

          // 2. Add all to target
          targetCat.transactions.push(...matchingTxs);
          targetCat.total += totalAmountMoved;

          setReport(updatedReport);
          alert(`Success! Moved ${matchingTxs.length} transactions matching "${description}" to ${category}. This rule will also be applied to all future statement uploads.`);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save rule. Please try again.');
    }
  };

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

      {report.categoryTotals && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white/90">Spending Categories</h2>
          <Card className="p-0 overflow-hidden divide-y divide-white/5">
            {[
              { id: 'shopping', label: 'Shopping', data: report.categoryTotals.shopping, color: 'bg-blue-500' },
              { id: 'food', label: 'Food Delivery', data: report.categoryTotals.food, color: 'bg-orange-500' },
              { id: 'quickComm', label: 'Quick-Comm', data: report.categoryTotals.quickComm, color: 'bg-emerald-500' },
              { id: 'other', label: 'Other / Vague', data: report.categoryTotals.other, color: 'bg-white/20' }
            ].map((cat) => {
              const amount = typeof cat.data === 'object' ? (cat.data.total || 0) : (cat.data || 0);
              return (
              <div key={cat.id} className="group">
                <button 
                  onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                  className="w-full p-5 text-left transition-colors active:bg-white/[0.03] cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-secondaryText font-bold">{cat.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">₹{amount.toLocaleString()}</span>
                      <div className={`transition-transform duration-300 ${expandedCategory === cat.id ? 'rotate-180' : ''}`}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (amount / report.statementSummary.totalDebits) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${cat.color}`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedCategory === cat.id && cat.data.transactions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-white/[0.02]"
                    >
                      <div className="px-5 pb-5 pt-2">
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                          {cat.data.transactions.length > 0 ? (
                            cat.data.transactions.map((tx: any, i: number) => (
                              <div key={i} className="flex flex-col gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition-colors relative group/tx">
                                <div className="flex justify-between items-start">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] text-white/80 leading-tight pr-4">{tx.description}</p>
                                    <p className="text-[9px] text-white/30 uppercase tracking-tighter mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                                  </div>
                                  <span className="text-[11px] font-medium text-white/90">₹{tx.amount.toLocaleString()}</span>
                                </div>
                                
                                {/* Quick Categorize Action */}
                                <div className="flex gap-2 mt-1 invisible group-hover/tx:visible transition-all">
                                   <span className="text-[9px] text-white/20 uppercase self-center mr-1">Move to:</span>
                                   {[
                                      { id: 'shopping', label: 'Shop', color: 'text-blue-400' },
                                      { id: 'food', label: 'Food', color: 'text-orange-400' },
                                      { id: 'quickComm', label: 'Quick', color: 'text-emerald-400' }
                                   ].map(btn => (
                                      cat.id !== btn.id && (
                                        <button 
                                          key={btn.id}
                                          onClick={() => handleCategorize(tx.description, btn.id, tx.amount, tx.date, cat.id)}
                                          className={`px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-medium hover:border-white/40 ${btn.color} transition-all active:scale-90`}
                                        >
                                          {btn.label}
                                        </button>
                                      )
                                   ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-white/20 italic">No transactions found in this period.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );})}
          </Card>
          
          <p className="text-[10px] text-white/20 italic text-center px-4 leading-relaxed">
            * Tap a category to view specific transactions. "Other" includes bills, transfers, and bank charges.
          </p>
        </section>
      )}

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
