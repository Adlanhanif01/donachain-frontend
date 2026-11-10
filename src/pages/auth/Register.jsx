import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, FileCheck2, HandHeart, ShieldCheck } from 'lucide-react';
import SiteLayout from '../../components/SiteLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const payload = new FormData(event.currentTarget);
    payload.set('role', role);

    try {
      const account = await register(payload);
      navigate(account.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <main className="simple-register">
        <section className="register-intro">
          <span className="eyebrow">BUAT AKUN DONACHAIN</span>
          <h1>Mulai berkontribusi secara transparan.</h1>
          <p>Semua akun dapat menjelajahi campaign. CC juga memiliki peran Donatur dan dapat mengajukan campaign setelah verifikasi Admin.</p>
          <div className="register-art">
            <ShieldCheck size={78} />
            <div>Akun Admin hanya dibuat oleh tim IT.</div>
          </div>
        </section>
        <section className="register-form-panel">
          <h2>Daftar akun</h2>
          <p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>
          <div className="role-picker">
            <button
              type="button"
              className={`role-choice ${role === 'donor' ? 'selected' : ''}`}
              onClick={() => setRole('donor')}
            >
              <HandHeart />
              <span><b>Donatur</b><small>Jelajahi campaign dan dukung tujuan.</small></span>
            </button>
            <button
              type="button"
              className={`role-choice ${role === 'creator' ? 'selected' : ''}`}
              onClick={() => setRole('creator')}
            >
              <FileCheck2 />
              <span><b>Campaign Creator + Donatur</b><small>Dapat mendukung campaign creator lain dan mengajukan campaign setelah verifikasi.</small></span>
            </button>
          </div>

          <form className="register-fields" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Nama lengkap</label>
            <input id="register-name" name="name" autoComplete="name" required maxLength="255" />
            <label htmlFor="register-email">Alamat email</label>
            <input id="register-email" name="email" type="email" autoComplete="email" required />
            {role === 'creator' && (
              <>
                <label htmlFor="register-phone">Nomor telepon</label>
                <input id="register-phone" name="phone" type="tel" autoComplete="tel" required />
                <label htmlFor="register-address">Alamat</label>
                <textarea id="register-address" name="address" rows="3" required />
                <label htmlFor="register-organization">Nama organisasi/komunitas (opsional)</label>
                <input id="register-organization" name="organization" maxLength="255" />
                <label htmlFor="register-id-card">KTP/ID (JPG, PNG, PDF; maks. 5 MB)</label>
                <input id="register-id-card" name="id_card" type="file" accept=".jpg,.jpeg,.png,.pdf" required />
              </>
            )}
            <label htmlFor="register-password">Kata sandi (minimal 8 karakter)</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength="8"
              required
            />
            <label htmlFor="register-password-confirmation">Konfirmasi kata sandi</label>
            <input
              id="register-password-confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              minLength="8"
              required
            />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="btn-primary full" disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Buat akun'} <ArrowRight />
            </button>
            {role === 'creator' && (
              <p className="form-hint">Akun CC memiliki peran Donatur juga. Pengajuan campaign aktif setelah data verifikasi disetujui Admin.</p>
            )}
          </form>
        </section>
      </main>
    </SiteLayout>
  );
}
