import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/map', label: 'Map' },
    { to: '/report', label: 'Report' },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin-dashboard', label: 'Admin' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#F5F3EC]/90 backdrop-blur-md border-b border-gray-200/60">
      <div className="max-w-[960px] mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1B5E3C] text-white text-sm font-bold font-serif leading-none">
            C
          </span>
          <span className="font-serif text-[17px] font-semibold text-[#0f172a] tracking-tight">
            CivicPulse
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7 ml-auto mr-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[13px] transition-colors ${
                pathname === link.to
                  ? 'text-[#0f172a] font-medium'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <span className="inline-flex items-center text-[12px] font-semibold px-3 py-1 rounded-full bg-[#0f172a] text-white">
                {user.role === 'admin' ? 'Admin' : 'Citizen'}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-[#0f172a] transition-colors cursor-pointer px-2 py-1"
              >
                <LogoutIcon />
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-[13px] font-medium px-5 py-1.5 rounded-full bg-[#D3D3D3] text-white hover:bg-[#B0B0B0] transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
