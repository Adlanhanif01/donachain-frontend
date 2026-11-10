import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const sections = [
  { id: 'campaigns', label: 'Jelajahi' },
  { id: 'how-it-works', label: 'Cara Kerja' },
  { id: 'transparency', label: 'Transparansi' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');

  const scrollToSection = useCallback((id) => {
    const section = document.getElementById(id);
    if (!section) return;

    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY,
      behavior: 'auto',
    });
  }, []);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;

    const frameId = window.requestAnimationFrame(() => {
      scrollToSection(decodeURIComponent(location.hash.slice(1)));
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash, scrollToSection]);

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
      navigate('/');
    } catch (error) {
      setLogoutError(error.message);
    }
  }

  return (
    <>
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand-mark"><ShieldCheck size={18} /></span>
        DonaChain
      </Link>
      <nav>
        {sections.map(({ id, label }) => (
          <Link
            key={id}
            to={`/#${id}`}
            onClick={() => location.pathname === '/' && scrollToSection(id)}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="top-actions">
        {user ? (
          <>
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>Dashboard</Link>
            <button className="header-logout" type="button" onClick={handleLogout}>Keluar</button>
          </>
        ) : (
          <>
            <Link to="/login">Masuk</Link>
            <Link className="small-cta" to="/register">Daftar <ArrowRight size={13} /></Link>
          </>
        )}
      </div>
    </header>
    {logoutError && <div className="global-error" role="alert">{logoutError}</div>}
    </>
  );
}