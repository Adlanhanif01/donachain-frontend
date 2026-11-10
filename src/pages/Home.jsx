import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import SiteLayout from '../components/SiteLayout.jsx';
import { apiRequest } from '../lib/api.js';
import { formatEther, formatStatus } from '../lib/format.js';

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    apiRequest(`/campaigns${query ? `?search=${encodeURIComponent(query)}` : ''}`)
      .then((result) => {
        if (active) setCampaigns(result.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <SiteLayout>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><ShieldCheck size={12} /> DONASI TRANSPARAN BERBASIS BLOCKCHAIN</span>
            <h1>Dukung Dampak yang <em>Terukur</em></h1>
            <p>
              Jelajahi campaign dengan pencairan dana bertahap berdasarkan milestone.
              Bukti progres ditinjau sebelum proses pencairan Web3 diaktifkan.
            </p>
            <div className="hero-buttons">
              <a className="btn-primary" href="#campaigns">Jelajahi Campaign <ArrowRight size={14} /></a>
              <Link className="btn-secondary" to="/register">Daftar sebagai Creator</Link>
            </div>
            <p className="web3-note">
              Tahap ini menyiapkan alur Web 2. Donasi dan pencairan testnet belum aktif.
            </p>
          </div>
          <div className="hero-feature hero-feature-copy">
            <ShieldCheck size={42} />
            <h2>Setiap tahap dapat ditinjau</h2>
            <p>Creator mengajukan campaign dan bukti milestone. Admin melakukan verifikasi di platform.</p>
          </div>
        </section>

        <section className="campaign-section section" id="campaigns">
          <div className="campaign-head">
            <div className="section-title">
              <span>CAMPAIGN YANG DISETUJUI</span>
              <h2>Jelajahi Campaign</h2>
              <p>Target campaign ditampilkan dalam ETH sebagai persiapan integrasi jaringan Sepolia.</p>
            </div>
            <form
              className="campaign-filters"
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(search.trim());
              }}
            >
              <input
                aria-label="Cari campaign"
                placeholder="Cari campaign..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit">Cari</button>
            </form>
          </div>

          {error && <p className="form-error" role="alert">Tidak dapat memuat campaign: {error}</p>}
          {loading && <p className="page-state">Memuat campaign...</p>}
          {!loading && !error && campaigns.length === 0 && (
            <p className="empty-state">Belum ada campaign aktif yang disetujui.</p>
          )}
          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <article className="campaign-card" key={campaign.id}>
                <div className="campaign-image campaign-image--placeholder">
                  {campaign.thumbnail_url
                    ? <img src={campaign.thumbnail_url} alt={campaign.title} />
                    : <div className="campaign-image-placeholder">
                      <ShieldCheck size={28} />
                      <span>Campaign DonaChain</span>
                    </div>}
                  <span>{campaign.category || 'CAMPAIGN'}</span>
                </div>
                <div className="campaign-body">
                  <h3>{campaign.title}</h3>
                  <p>{campaign.description}</p>
                  <div className="raised">
                    <b>Target {formatEther(campaign.target_amount)}</b>
                  </div>
                  <div className="campaign-meta">
                    <span>{campaign.milestones?.length || 0} milestone</span>
                    <span>{formatStatus(campaign.status)}</span>
                  </div>
                  <div className="campaign-bottom">
                    <span><CheckCircle2 size={12} /> Creator: {campaign.creator?.name}</span>
                    <Link to={`/campaigns/${campaign.id}`}>Detail <ArrowRight size={12} /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
