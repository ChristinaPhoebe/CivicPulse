import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Login = () => {
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (role === 'admin') {
        await login('admin@civicpulse.com', password);
        navigate('/admin-dashboard');
      } else {
        demoLogin('citizen');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-5">
      <h1 className="sm:text-[40px] font-semibold text-[#0f172a] mb-2">
        Welcome
      </h1>
      <p className="text-gray-400 text-[15px] mb-8">
        Choose your role and sign in to continue.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] w-full max-w-[400px] p-8">
        <form onSubmit={handleSubmit}>
          {/* Role */}
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 block">
            Role
          </label>
          <div className="flex gap-2 mb-6">
            {(['citizen', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(''); setPassword(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                  role === r
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'bg-[#F5F3EC] text-gray-400 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {r === 'citizen' ? <PersonIcon /> : <ShieldIcon />}
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Password */}
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 block">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="w-full px-5 py-2.5 rounded-full border border-gray-200 bg-[#FAF9F7] text-[14px] text-[#0f172a] placeholder:text-gray-300 outline-none focus:border-[#1B5E3C] transition-colors mb-4"
          />

          {/* Error */}
          {error && (
            <p className="text-red-500 text-[13px] mb-4">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-[#1B5E3C] text-white font-semibold text-[14px] hover:bg-[#164d32] transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-[12px] text-gray-400">
        CivicPulse &middot; Built for stronger neighborhoods
      </footer>
    </div>
  );
};

export default Login;
