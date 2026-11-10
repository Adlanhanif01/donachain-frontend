import { useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function SiteLayout({ children }) {
  const { pathname } = useLocation();
  const route = pathname.replace(/\/+$/, '');
  const showFooter = route !== '/login' && route !== '/register';

  return (
    <div className="site-shell">
      <Header />
      {children}
      {showFooter && <Footer />}
    </div>
  );
}