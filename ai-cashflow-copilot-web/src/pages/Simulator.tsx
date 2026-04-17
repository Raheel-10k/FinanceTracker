import { useState, useEffect } from 'react';
import Card from '../components/Card';
import GuiltMeter from '../components/GuiltMeter';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function Simulator() {
  const { report } = useAppStore();
  
  const [reduceSpend, setReduceSpend] = useState(100);
  const [extraIncome, setExtraIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatting, setChatting] = useState(false);
  
  useEffect(() => {
     api.get('/simulate/chat').then(res => setChatHistory(res.data.chats)).catch(console.error);
  }, []);

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/simulate', {
        reduceDailySpend: reduceSpend,
        extraIncome,
        delayIncomeDays: 0
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runChat = async () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');
    setChatting(true);
    
    try {
      const res = await api.post('/simulate/chat', { message: newMessage.content });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Failed to connect to the advisor.' }]);
    } finally {
      setChatting(false);
    }
  };

  if(!report) return <div className="p-6 pt-12">Upload statement to simulate.</div>;

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

        <button 
            onClick={simulate}
            disabled={loading}
            className="w-full h-14 bg-white/10 text-white rounded-2xl mt-4 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
        </button>

        {result && (
            <Card className="mt-8 bg-cardHover border-white/10">
            <h3 className="text-sm font-medium mb-4">Projected Results</h3>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                <span className="text-secondaryText text-sm">New Runway</span>
                <span className="text-xl font-semibold text-white">{result.newRunway} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                <span className="text-secondaryText text-sm">New Score</span>
                <span className="text-xl font-semibold">{result.newScore}/100</span>
                </div>

                <div className="flex justify-between items-center">
                <span className="text-secondaryText text-sm">Proj. Balance</span>
                <span className="text-xl font-semibold text-success">₹{result.projectedBalance.toLocaleString()}</span>
                </div>

                <div className="pt-2 pb-2">
                <GuiltMeter score={result.newGuiltScore} />
                </div>

                <p className="text-xs text-white/90 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                    {result.aiAdvice}
                </p>
            </div>
            </Card>
        )}

        <div className="mt-10 border-t border-white/10 pt-8 space-y-4 pb-10">
          <h2 className="text-lg font-medium text-white/90">"What If?" Scenarios</h2>
          <p className="text-sm text-secondaryText mb-2">Ask the AI Copilot how specific purchases will impact your metrics.</p>

          <Card className="bg-card/40 border-white/5 h-72 overflow-y-auto space-y-3 p-4 flex flex-col mb-2">
            {chatHistory.length === 0 && (
              <p className="text-xs text-secondaryText text-center m-auto">Start a simulation conversation here.</p>
            )}
            {chatHistory.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-white/10 text-white/90 rounded-bl-sm border border-white/5'}`}>
                   {msg.content}
                 </div>
               </div>
            ))}
            {chatting && (
               <div className="flex justify-start">
                 <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-white/10 text-white/50 rounded-bl-sm border border-white/5 animate-pulse">
                   Thinking...
                 </div>
               </div>
            )}
          </Card>

          <div className="flex gap-2">
            <input 
               className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-colors"
               placeholder="What if I buy a car worth 5 Lakhs now?"
               value={chatMessage}
               onChange={(e) => setChatMessage(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && runChat()}
            />
            <button 
               onClick={runChat}
               disabled={chatting || !chatMessage.trim()}
               className="bg-white text-black px-5 rounded-xl font-medium text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
