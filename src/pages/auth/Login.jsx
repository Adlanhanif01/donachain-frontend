import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import SiteLayout from '../../components/SiteLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const account = await login(form);
      navigate(account.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <main className="simple-auth">
        <section className="auth-promo">
          <span className="eyebrow">AKSES DONACHAIN</span>
          <h1>Kelola kontribusi dengan <em>transparan</em></h1>
          <p>Masuk untuk mengakses fitur sesuai peran akun Anda.</p>
          <div className="promo-points">
            <span><ShieldCheck /> Akses akun terproteksi</span>
            <span><LockKeyhole /> Transaksi blockchain belum diaktifkan di tahap Web 2</span>
          </div>
        </section>
        <section className="auth-form-panel">
          <h2>Masuk ke akun</h2>
          <p>Gunakan email dan kata sandi yang terdaftar.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Alamat email</label>
            <div className="field">
              <Mail />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <label htmlFor="login-password">Kata sandi</label>
            <div className="field">
              <LockKeyhole />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="btn-primary full" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Masuk'} <ArrowRight />
            </button>
          </form>
          <div className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar sebagai Donatur atau Creator</Link>
          </div>
          <p className="admin-note">Akun Admin dibuat internal oleh tim IT, bukan melalui pendaftaran ini.</p>
        </section>
      </main>
    </SiteLayout>
  );
}
