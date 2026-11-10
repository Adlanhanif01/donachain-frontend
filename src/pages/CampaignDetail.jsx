import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout.jsx';
import { apiFileUrl, apiRequest } from '../lib/api.js';
import { formatEther, formatStatus } from '../lib/format.js';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/campaigns/${id}`)
      .then(setCampaign)
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  return (
    <SiteLayout>
      <main className="content-page">
        <Link className="back-link" to="/">← Kembali ke campaign</Link>
        {error && <p className="form-error" role="alert">{error}</p>}
        {!campaign && !error && <p className="page-state">Memuat detail campaign...</p>}
        {campaign && (
          <article className="detail-card">
            {campaign.thumbnail_url && <img className="detail-hero-image" src={campaign.thumbnail_url} alt={campaign.title} />}
            <span className="eyebrow">{campaign.category || 'CAMPAIGN'}</span>
            <h1>{campaign.title}</h1>
            <p className="detail-description">{campaign.description}</p>
            <dl className="campaign-facts">
              <div><dt>Target</dt><dd>{formatEther(campaign.target_amount)}</dd></div>
              <div><dt>Creator</dt><dd>{campaign.creator?.name}</dd></div>
              <div><dt>Status</dt><dd>{formatStatus(campaign.status)}</dd></div>
            </dl>
            <section className="milestone-list">
              <h2>Rencana milestone</h2>
              {campaign.milestones.map((milestone, index) => (
                <article className="milestone-row" key={milestone.id}>
                  <div>
                    <span className="milestone-index">Milestone {index + 1} · {milestone.amount_percentage}%</span>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                  <span className={`status-pill status-${milestone.status}`}>{formatStatus(milestone.status)}</span>
                  {milestone.status === 'verified' && (
                    <a
                      className="btn-secondary"
                      href={apiFileUrl(`/campaigns/${campaign.id}/milestones/${milestone.id}/proof`)}
                    >
                      Unduh bukti terverifikasi
                    </a>
                  )}
                </article>
              ))}
            </section>
            <p className="web3-note">
              Donasi dan penarikan dana belum tersedia. Transaksi akan diaktifkan pada tahap integrasi smart contract Sepolia.
            </p>
          </article>
        )}
      </main>
    </SiteLayout>
  );
}
