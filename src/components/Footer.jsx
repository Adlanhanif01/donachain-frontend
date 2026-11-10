import { Link } from 'react-router-dom';
import { Instagram, Mail, MessageCircle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-about">
        <Link className="brand" to="/">
          <span className="brand-mark"><ShieldCheck size={17} /></span>
          DonaChain
        </Link>
        <p>Platform berbasis rantai blok yang menghubungkan donatur dengan inisiatif berdampak.</p>
      </div>
      <div>
        <h4>TRANSPARANSI</h4>
        <a href="/#transparency">Laporan rantai blok</a>
        <a href="/#how-it-works">Verifikasi pencapaian</a>
        <a href="/#transparency">Data dampak tahunan</a>
      </div>
      <div>
        <h4>SUMBER DAYA</h4>
        <a href="#help">Pusat bantuan</a>
        <a href="#terms">Ketentuan layanan</a>
        <a href="#privacy">Kebijakan privasi</a>
      </div>
      <div>
        <h4>DUKUNGAN</h4>
        <div className="socials"><Mail /><Instagram /><MessageCircle /></div>
        <small>© 2026 Yayasan DonaChain.<br />Hak cipta dilindungi.</small>
      </div>
    </footer>
  );
}
