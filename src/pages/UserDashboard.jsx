import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Clock3, ImagePlus, Megaphone } from 'lucide-react';
import SiteLayout from '../components/SiteLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../lib/api.js';
import { formatStatus } from '../lib/format.js';

const blankMilestone = () => ({ title: '', description: '', amount_percentage: '' });

export default function UserDashboard() {
  const { user } = useAuth();
  const isCreator = user.roles?.includes('creator') ?? user.role === 'creator';
  const isDonor = user.roles?.includes('donor') ?? user.role === 'donor';
  const [campaigns, setCampaigns] = useState([]);
  const [milestones, setMilestones] = useState([
    { title: '', description: '', amount_percentage: '50' },
    { title: '', description: '', amount_percentage: '50' },
  ]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const loadCampaigns = useCallback(async () => {
    setError('');
    if (user.role !== 'creator') return;
    const items = await apiRequest('/creator/campaigns');
    setCampaigns(items);
  }, [user.role]);

  useEffect(() => {
    loadCampaigns().catch((requestError) => setError(requestError.message));
  }, [loadCampaigns]);

  useEffect(() => () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
  }, [thumbnailPreview]);

  async function createCampaign(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setError('');
    setNotice('');
    setSubmitting(true);
    const payload = new FormData(form);

    milestones.forEach((milestone, index) => {
      payload.set(`milestones[${index}][title]`, milestone.title);
      payload.set(`milestones[${index}][description]`, milestone.description);
      payload.set(`milestones[${index}][amount_percentage]`, milestone.amount_percentage);
    });

    try {
      await apiRequest('/creator/campaigns', { method: 'POST', body: payload });
      form.reset();
      setThumbnailPreview('');
      setMilestones([
        { title: '', description: '', amount_percentage: '50' },
        { title: '', description: '', amount_percentage: '50' },
      ]);
      setNotice('Campaign terkirim dan menunggu persetujuan Admin.');
      await loadCampaigns();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitProof(event, campaign, milestone) {
    event.preventDefault();
    setError('');
    setNotice('');
    const file = new FormData(event.currentTarget).get('proof');
    const data = new FormData();
    data.set('proof', file);

    try {
      await apiRequest(
        `/creator/campaigns/${campaign.id}/milestones/${milestone.id}/proof`,
        { method: 'POST', body: data },
      );
      setNotice('Bukti milestone berhasil dikirim untuk ditinjau.');
      await loadCampaigns();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const percentageTotal = milestones.reduce(
    (total, milestone) => total + (Number(milestone.amount_percentage) || 0),
    0,
  );
  const activeCampaignCount = campaigns.filter((campaign) => campaign.status === 'active').length;
  const pendingCampaignCount = campaigns.filter((campaign) => campaign.status === 'pending').length;
  const milestoneCount = campaigns.reduce((total, campaign) => total + campaign.milestones.length, 0);

  return (
    <SiteLayout>
      <main className="content-page">
        <header className="page-heading">
          <span className="eyebrow">{user.role === 'creator' ? 'DASHBOARD CREATOR' : 'DASHBOARD DONATUR'}</span>
          <h1>Halo, {user.name}</h1>
          <p>
            {isCreator
              ? `Peran CC dan Donatur · Status verifikasi: ${formatStatus(user.verification_status)}`
              : 'Jelajahi campaign yang telah disetujui.'}
          </p>
        </header>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}

        {isDonor && isCreator && (
          <section className="panel creator-donor-panel">
            <div>
              <span className="panel-kicker">DUKUNG CAMPAIGN LAIN</span>
              <h2>Anda juga seorang Donatur</h2>
              <p>Jelajahi campaign dari CC lain. Fitur transaksi donasi akan tersedia setelah integrasi wallet dan smart contract.</p>
            </div>
            <Link className="btn-secondary" to="/#campaigns">Jelajahi campaign</Link>
          </section>
        )}

        {isDonor && !isCreator ? (
          <section className="panel">
            <h2>Campaign aktif</h2>
            <p>Fitur donasi dan riwayat transaksi akan tersedia setelah integrasi wallet dan smart contract.</p>
            <Link className="btn-primary" to="/">Jelajahi campaign</Link>
          </section>
        ) : isCreator && user.verification_status === 'pending' ? (
          <section className="panel">
            <h2>Verifikasi sedang ditinjau</h2>
            <p>Tim Admin akan meninjau data dan dokumen KTP/ID Anda. Pembuatan campaign aktif setelah akun disetujui.</p>
          </section>
        ) : isCreator && user.verification_status === 'rejected' ? (
          <section className="panel">
            <h2>Verifikasi belum disetujui</h2>
            <p>Silakan hubungi Admin untuk mengetahui tindak lanjut verifikasi akun.</p>
          </section>
        ) : isCreator ? (
          <>
            <section className="dashboard-stats" aria-label="Ringkasan campaign">
              <article className="dashboard-stat">
                <span className="dashboard-stat__icon"><Megaphone size={18} /></span>
                <div><span>Total campaign</span><strong>{campaigns.length}</strong><small>Semua pengajuan Anda</small></div>
              </article>
              <article className="dashboard-stat">
                <span className="dashboard-stat__icon is-green"><BadgeCheck size={18} /></span>
                <div><span>Campaign aktif</span><strong>{activeCampaignCount}</strong><small>Sudah disetujui Admin</small></div>
              </article>
              <article className="dashboard-stat">
                <span className="dashboard-stat__icon is-amber"><Clock3 size={18} /></span>
                <div><span>Menunggu tinjauan</span><strong>{pendingCampaignCount}</strong><small>{milestoneCount} milestone direncanakan</small></div>
              </article>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div><span className="panel-kicker">MULAI GALANG DANA</span><h2>Ajukan campaign</h2></div>
                <span className="panel-heading__badge"><BadgeCheck size={14} /> Tinjauan Admin</span>
              </div>
              <form className="stacked-form" onSubmit={createCampaign}>
                <label>Judul campaign<input name="title" required maxLength="255" /></label>
                <label>Kategori<input name="category" maxLength="100" /></label>
                <label>Deskripsi<textarea name="description" required rows="5" /></label>
                <label>Target (ETH)<input name="target_amount" type="number" step="0.000000000000000001" min="0.000000000000000001" required /></label>
                <div className="thumbnail-upload">
                  <label className="thumbnail-upload__preview" htmlFor="campaign-thumbnail">
                    {thumbnailPreview
                      ? <img src={thumbnailPreview} alt="Pratinjau thumbnail campaign" />
                      : <><ImagePlus size={25} /><span>Tambah foto</span></>}
                  </label>
                  <div className="thumbnail-upload__details">
                    <strong>Thumbnail campaign <span>Opsional</span></strong>
                    <p>Gunakan foto yang mewakili campaign. JPG, PNG, atau WebP, maksimal 5 MB.</p>
                    <input
                      className="thumbnail-file-input"
                      id="campaign-thumbnail"
                      name="thumbnail"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setThumbnailPreview(file ? URL.createObjectURL(file) : '');
                      }}
                    />
                  </div>
                </div>
                <div className="milestone-editor">
                  <div className="section-heading">
                    <h3>Milestone</h3>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={milestones.length >= 20}
                      onClick={() => setMilestones([...milestones, blankMilestone()])}
                    >
                      Tambah milestone
                    </button>
                  </div>
                  {milestones.map((milestone, index) => (
                    <fieldset className="milestone-fields" key={index}>
                      <legend>Milestone {index + 1}</legend>
                      <label>Judul<input required value={milestone.title} onChange={(event) => setMilestones(milestones.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /></label>
                      <label>Deskripsi<textarea required rows="2" value={milestone.description} onChange={(event) => setMilestones(milestones.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} /></label>
                      <label>Persentase pencairan<input type="number" min="1" max="100" required value={milestone.amount_percentage} onChange={(event) => setMilestones(milestones.map((item, itemIndex) => itemIndex === index ? { ...item, amount_percentage: event.target.value } : item))} /></label>
                      {milestones.length > 1 && (
                        <button type="button" className="text-button" onClick={() => setMilestones(milestones.filter((_, itemIndex) => itemIndex !== index))}>Hapus milestone</button>
                      )}
                    </fieldset>
                  ))}
                  <p className={percentageTotal === 100 ? 'form-success' : 'form-hint'}>
                    Total persentase: {percentageTotal}% (wajib tepat 100%)
                  </p>
                </div>
                <button className="btn-primary" disabled={submitting || percentageTotal !== 100}>
                  {submitting ? 'Mengirim...' : 'Ajukan campaign'}
                </button>
              </form>
            </section>

            <details className="panel campaign-history">
              <summary className="campaign-history__summary">
                <span><span className="panel-kicker">PERKEMBANGAN PENGAJUAN</span><strong>Campaign saya</strong></span>
                <span className="panel-heading__count">{campaigns.length} campaign</span>
              </summary>
              {campaigns.length === 0 ? <p>Anda belum mengajukan campaign.</p> : campaigns.map((campaign) => (
                <article className="creator-campaign" key={campaign.id}>
                  <div className="section-heading">
                    {campaign.thumbnail_url && <img className="creator-campaign__image" src={campaign.thumbnail_url} alt="" />}
                    <div className="creator-campaign__heading"><h3>{campaign.title}</h3><span className={`status-pill status-${campaign.status}`}>{formatStatus(campaign.status)}</span></div>
                  </div>
                  {campaign.admin_note && <p className="form-hint">Catatan Admin: {campaign.admin_note}</p>}
                  {campaign.milestones.map((milestone) => (
                    <div className="milestone-row" key={milestone.id}>
                      <div>
                        <h4>{milestone.title} · {milestone.amount_percentage}%</h4>
                        <p>{milestone.description}</p>
                        <span className={`status-pill status-${milestone.status}`}>{formatStatus(milestone.status)}</span>
                        {milestone.admin_note && <p className="form-hint">Catatan Admin: {milestone.admin_note}</p>}
                      </div>
                      {campaign.status === 'active' && ['pending', 'rejected'].includes(milestone.status) && (
                        <form className="proof-form" onSubmit={(event) => submitProof(event, campaign, milestone)}>
                          <label>
                            Unggah bukti (JPG, PNG, PDF; maks. 10 MB)
                            <input name="proof" type="file" accept=".jpg,.jpeg,.png,.pdf" required />
                          </label>
                          <button className="btn-secondary">Kirim bukti</button>
                        </form>
                      )}
                    </div>
                  ))}
                </article>
              ))}
            </details>
          </>
        ) : null}
      </main>
    </SiteLayout>
  );
}
