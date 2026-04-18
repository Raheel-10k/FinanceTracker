import { useState, useEffect, useRef } from 'react';
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
     api.get('/simulate/chat').then(res => setChatHistory(res.data.chats)).catch(console.error);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatting]);

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

  const runChat = async (input?: string) => {
    const msgToSubmit = input || chatMessage;
    if (!msgToSubmit.trim()) return;
    
    const newMessage = { role: 'user', content: msgToSubmit };
    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');
    setChatting(true);
    
    try {
      const res = await api.post('/simulate/chat', { message: msgToSubmit });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Failed to connect to the advisor.' }]);
    } finally {
      setChatting(false);
    }
  };

  if(!report) return <div className="p-6 pt-12">Upload statement to simulate.</div>;

  const suggestions = [
    "Can I afford a new iPhone next month?",
    "What if I travel for 5 days?",
    "Impact of ₹10,000 credit card bill?"
  ];

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
            className="group relative w-full h-14 bg-white/10 text-white rounded-2xl mt-4 active:scale-95 transition-all overflow-hidden disabled:opacity-50"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-25 animate-comet pointer-events-none" />
            <span className="relative z-10">{loading ? 'Simulating...' : 'Run Simulation'}</span>
        </button>

        {result && (
            <Card className="mt-8 bg-cardHover border-white/10">
            <h3 className="text-sm font-medium mb-4">Projected Results</h3>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                <span className="text-secondaryText text-sm">Runway</span>
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

                <div className="mt-4 p-4 rounded-r-xl bg-white/[0.03] border-l-2 border-white/10 hover:border-white/40 transition-all duration-500 group">
                    <p className="text-[13px] leading-relaxed text-secondaryText italic group-hover:text-white/90 transition-colors duration-500">
                        "{result.aiAdvice}"
                    </p>
                </div>
            </div>
            </Card>
        )}

        <div className="mt-10 border-t border-white/10 pt-8 space-y-4 pb-20">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h2 className="text-lg font-medium text-white/90">"What If?" Scenarios</h2>
                <p className="text-xs text-secondaryText">Ask the AI Copilot about specific spends.</p>
             </div>
             <div className="bg-white/10 px-2 py-1 rounded-md text-[10px] uppercase font-bold text-white/60 border border-white/5">AI Advisor</div>
          </div>

          <Card className="bg-card/40 border-white/5 h-96 overflow-y-auto space-y-4 p-4 flex flex-col mb-4 custom-scrollbar">
            {chatHistory.length === 0 && (
              <div className="m-auto text-center space-y-2 opacity-50">
                 <span className="text-3xl block">🤖</span>
                 <p className="text-xs text-secondaryText">I'm aware of your {report.statementSummary.txCount} transactions. Ask me anything!</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/10 text-white/90 rounded-tl-none border border-white/10'}`}>
                   {msg.content}
                 </div>
               </div>
            ))}
            {chatting && (
               <div className="flex justify-start">
                 <div className="max-w-[85%] p-3.5 rounded-2xl text-sm bg-white/10 text-white/50 rounded-tl-none border border-white/10 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-150"></span>
                 </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
             {suggestions.map((s, idx) => (
               <button 
                  key={idx} 
                  onClick={() => runChat(s)}
                  className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] text-secondaryText hover:bg-white/10 transition-colors"
                >
                  {s}
               </button>
             ))}
          </div>

          <div className="sticky bottom-8 left-0 right-0 z-10 flex justify-center px-4">
            <div className="group w-full max-w-sm flex items-center gap-2 bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 pl-4 focus-within:border-white/20 focus-within:bg-white/[0.05] transition-all duration-500 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-25 animate-comet pointer-events-none opacity-50 transition-opacity group-focus-within:opacity-100" />
              <input 
                 className="flex-1 bg-transparent text-white text-[13px] py-2 outline-none placeholder:text-white/20 font-light relative z-10"
                 placeholder="Ask your copilot anything..."
                 value={chatMessage}
                 onChange={(e) => setChatMessage(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && runChat()}
              />
              <button 
                 onClick={() => runChat()}
                 disabled={chatting || !chatMessage.trim()}
                 className="h-9 px-4 rounded-[14px] bg-white text-black text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all duration-300 disabled:opacity-0 disabled:translate-x-2 overflow-hidden relative z-10"
              >
                {chatting ? 'Wait' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
