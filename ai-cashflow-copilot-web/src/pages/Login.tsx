import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const navigate = useNavigate();
  const setToken = useAppStore(state => state.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      useAppStore.getState().setUser(res.data.user);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-8 relative">
      <div className="w-full max-w-sm space-y-8 z-10">
        <div>
          <h1 className="text-3xl font-semibold text-white">Welcome Back</h1>
          <p className="text-secondaryText mt-2">Log in to your Copilot.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-secondaryText focus:outline-none focus:border-white/30 transition-colors"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-secondaryText focus:outline-none focus:border-white/30 transition-colors"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-black font-semibold rounded-2xl mt-4 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Continuing...' : 'Continue'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => navigate('/signup')}
            className="text-sm text-secondaryText hover:text-white transition-colors"
          >
            Don't have an account? <span className="text-white">Create one</span>
          </button>
        </div>
      </div>
    </div>
  );
}
