import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-md px-8 flex flex-col items-center z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center text-center space-y-4 mb-20"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-6 relative overflow-hidden backdrop-blur-sm">
            {/* Minimal iconic symbol representation */}
            <div className="absolute w-12 h-12 rounded-full border-[1.5px] border-white/80 scale-105" />
            <div className="absolute w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
          </div>
          
          <h1 className="text-3xl font-light tracking-tight text-white">
            AI Cashflow <br />
            <span className="font-medium">Survival Copilot</span>
          </h1>
          <p className="text-secondaryText text-sm font-light tracking-wider uppercase mt-4">
            Know when money runs out <br/> before it does.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="w-full flex justify-center mt-auto"
        >
          <button 
            onClick={() => navigate('/login')}
            className="group relative w-full h-14 rounded-full bg-white text-black font-semibold tracking-wide overflow-hidden transition-transform active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            Get Started
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="w-full mt-4"
        >
          <button 
            onClick={() => navigate('/app')}
            className="w-full h-14 rounded-full bg-transparent text-white/70 font-medium tracking-wide border border-white/10 hover:bg-white/5 transition-colors active:scale-95"
          >
            Try Demo
          </button>
        </motion.div>

      </div>
      
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
