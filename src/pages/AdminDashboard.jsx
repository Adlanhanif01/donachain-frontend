import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Clock3, FileCheck2, Megaphone, Users } from 'lucide-react';
import SiteLayout from '../components/SiteLayout.jsx';
import { apiRequest, downloadApiFile } from '../lib/api.js';
import { formatStatus } from '../lib/format.js';

export default function AdminDashboard() {
  const [creators, setCreators] = useState([]);
  const [creatorTotal, setCreatorTotal] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeQueue, setActiveQueue] = useState('creators');
  const pendingCampaigns = campaigns.filter((campaign) => campaign.status === 'pending');
  const pendingCampaignCount = pendingCampaigns.length;
  const waitingMilestones = campaigns.flatMap((campaign) => campaign.milestones
    .filter((milestone) => milestone.status === 'waiting_approval')
    .map((milestone) => ({ ...milestone, campaign })));
  const waitingMilestoneCount = waitingMilestones.length;

  const loadQueue = useCallback(async () => {
    setError('');
    const [creatorResult, campaignResult] = await Promise.all([
      apiRequest('/admin/creators'),
      apiRequest('/admin/campaigns'),
    ]);
    setCreators(creatorResult.data);
    setCreatorTotal(creatorResult.total ?? creatorResult.data.length);
    setCampaigns(campaignResult);
  }, []);

  useEffect(() => {
    loadQueue()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [loadQueue]);

  async function review(path, decision, note = '') {
    setError('');
    setNotice('');
    try {
      await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify({ decision, note }),
      });
      setNotice('Keputusan berhasil disimpan.');
      await loadQueue();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function download(path, filename) {
    setError('');
    try {
      await downloadApiFile(path, filename);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <SiteLayout>
      <main className="content-page">
        <header className="page-heading">
          <span className="eyebrow">ADMINISTRATOR · RUANG KERJA</span>
          <h1>Panel persetujuan</h1>
          <p>Kelola antrean verifikasi creator, campaign, dan bukti milestone dalam satu tempat.</p>
        </header>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}
        {loading && <p className="page-state">Memuat antrean...</p>}

        <section className="dashboard-stats" aria-label="Ringkasan antrean admin">
          <article className="dashboard-stat">
            <span className="dashboard-stat__icon"><Users size={18} /></span>
            <div><span>Creator menunggu</span><strong>{creatorTotal}</strong><small>Perlu verifikasi identitas</small></div>
          </article>
          <article className="dashboard-stat">
            <span className="dashboard-stat__icon is-amber"><Clock3 size={18} /></span>
            <div><span>Campaign menunggu</span><strong>{pendingCampaignCount}</strong><small>Perlu keputusan Admin</small></div>
          </article>
          <article className="dashboard-stat">
            <span className="dashboard-stat__icon is-green"><FileCheck2 size={18} /></span>
            <div><span>Bukti milestone</span><strong>{waitingMilestoneCount}</strong><small>Menunggu verifikasi</small></div>
          </article>
        </section>

        <nav className="admin-queue-nav" aria-label="Pilih antrean verifikasi">
          <button
            type="button"
            className={activeQueue === 'creators' ? 'is-active' : ''}
            aria-pressed={activeQueue === 'creators'}
            onClick={() => setActiveQueue('creators')}
          >
            <Users size={15} /> Pendaftar CC <span>{creatorTotal}</span>
          </button>
          <button
            type="button"
            className={activeQueue === 'campaigns' ? 'is-active' : ''}
            aria-pressed={activeQueue === 'campaigns'}
            onClick={() => setActiveQueue('campaigns')}
          >
            <Megaphone size={15} /> Campaign <span>{pendingCampaignCount}</span>
          </button>
          <button
            type="button"
            className={activeQueue === 'milestones' ? 'is-active' : ''}
            aria-pressed={activeQueue === 'milestones'}
            onClick={() => setActiveQueue('milestones')}
          >
            <FileCheck2 size={15} /> Bukti milestone <span>{waitingMilestoneCount}</span>
          </button>
        </nav>

        {activeQueue === 'creators' && (
          <section className="panel admin-queue-panel">
            <div className="panel-heading">
              <div><span className="panel-kicker">AKUN DAN IDENTITAS</span><h2>Verifikasi pendaftar CC</h2></div>
              <span className="panel-heading__count">{creatorTotal} menunggu</span>
            </div>
            {creators.length === 0 && !loading && <p>Tidak ada pendaftar CC yang menunggu verifikasi.</p>}
            {creators.map((creator) => (
              <article className="review-card" key={creator.id}>
                <div>
                  <h3>{creator.name}</h3>
                  <p>{creator.email} · {creator.phone}</p>
                  <p>{creator.address}</p>
                  {creator.organization && <p>{creator.organization}</p>}
                </div>
                <div className="review-actions">
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => download(`/admin/creators/${creator.id}/id-card`, `creator-${creator.id}-id`)}
                  >
                    Unduh KTP/ID
                  </button>
                  <button className="btn-primary" type="button" onClick={() => review(`/admin/creators/${creator.id}/review`, 'approve')}>
                    Setujui
                  </button>
                  <button className="btn-danger" type="button" onClick={() => review(`/admin/creators/${creator.id}/review`, 'reject')}>
                    Tolak
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {activeQueue === 'campaigns' && (
          <section className="panel admin-queue-panel">
            <div className="panel-heading">
              <div><span className="panel-kicker">KONTEN DAN PENDANAAN</span><h2>Tinjauan campaign</h2></div>
              <span className="panel-heading__count">{pendingCampaignCount} menunggu</span>
            </div>
            {pendingCampaigns.length === 0 && !loading && <p>Tidak ada campaign yang menunggu persetujuan.</p>}
            {pendingCampaigns.map((campaign) => (
              <article className="review-card review-card-column" key={campaign.id}>
                <div className="review-campaign-heading">
                  {campaign.thumbnail_url
                    ? <img className="review-campaign-image" src={campaign.thumbnail_url} alt="" />
                    : <span className="review-campaign-image review-campaign-image--empty"><BadgeCheck size={20} /></span>}
                  <div>
                    <h3>{campaign.title}</h3>
                    <p>{campaign.creator?.name} · <span className={`status-pill status-${campaign.status}`}>{formatStatus(campaign.status)}</span></p>
                    <p>{campaign.description}</p>
                  </div>
                </div>
                {campaign.status === 'pending' && (
                  <div className="review-actions">
                    <button className="btn-primary" type="button" onClick={() => review(`/admin/campaigns/${campaign.id}/review`, 'approve')}>
                      Setujui campaign
                    </button>
                    <button className="btn-danger" type="button" onClick={() => review(`/admin/campaigns/${campaign.id}/review`, 'reject')}>
                      Tolak campaign
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {activeQueue === 'milestones' && (
          <section className="panel admin-queue-panel">
            <div className="panel-heading">
              <div><span className="panel-kicker">BUKTI PROGRES CAMPAIGN</span><h2>Verifikasi milestone</h2></div>
              <span className="panel-heading__count">{waitingMilestoneCount} menunggu</span>
            </div>
            {waitingMilestones.length === 0 && !loading && <p>Tidak ada bukti milestone yang menunggu verifikasi.</p>}
            {waitingMilestones.map(({ campaign, ...milestone }) => (
              <article className="admin-milestone admin-milestone--queue" key={milestone.id}>
                <div>
                  <span className="milestone-index">{campaign.title}</span>
                  <h4>{milestone.title} · {milestone.amount_percentage}%</h4>
                  <p>{milestone.description}</p>
                  <span className={`status-pill status-${milestone.status}`}>{formatStatus(milestone.status)}</span>
                </div>
                <div className="review-actions">
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => download(`/admin/milestones/${milestone.id}/proof`, `milestone-${milestone.id}-proof`)}
                  >
                    Lihat bukti
                  </button>
                  <button className="btn-primary" type="button" onClick={() => review(`/admin/milestones/${milestone.id}/review`, 'approve')}>
                    Verifikasi
                  </button>
                  <button className="btn-danger" type="button" onClick={() => review(`/admin/milestones/${milestone.id}/review`, 'reject')}>
                    Tolak bukti
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
        <p className="web3-note web3-note--admin"><BadgeCheck size={15} /> Persetujuan milestone di tahap Web 2 hanya mencatat keputusan platform. Transaksi on-chain di Sepolia belum diaktifkan.</p>
      </main>
    </SiteLayout>
  );
}
