import { Fingerprint, ShieldCheck, ExternalLink } from 'lucide-react';

export default function PromoPanel() {
  return (
    <aside className="promo-panel">
      <div className="promo-panel__content">
        <span className="eyebrow"><ShieldCheck size={12} /> INFRASTRUKTUR TERVERIFIKASI</span>
        <h1>Masa Depan Donasi yang <span>Transparan</span></h1>
        <p className="promo-panel__lead">
          Akses akun DonaChain Anda dengan aman untuk memantau pencapaian, memverifikasi
          transaksi di rantai blok, dan mengelola kontribusi dengan tenang.
        </p>
        <div className="feature-list">
          <div className="feature">
            <span className="feature__icon"><Fingerprint size={18} /></span>
            <div>
              <strong>Autentikasi Biometrik dan Multifaktor</strong>
              <p>Akun Anda dilindungi enkripsi standar industri dan dukungan kunci keamanan.</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature__icon"><ShieldCheck size={18} /></span>
            <div>
              <strong>Kontrak Pintar yang Diaudit</strong>
              <p>Protokol keuangan platform dirancang dengan mengutamakan keamanan dan transparansi.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="promo-panel__stats">
        <div><strong>Rp0</strong><span>TOTAL DONASI TRANSPARAN</span></div>
        <div><strong>0</strong><span>DONATUR TERVERIFIKASI</span></div>
        <a href="#transparency">Laporan transparansi <ExternalLink size={11} /></a>
      </div>
    </aside>
  );
}
