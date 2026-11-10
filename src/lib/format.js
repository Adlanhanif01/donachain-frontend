export function formatEther(value) {
  return `${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 4,
  }).format(Number(value || 0))} ETH`;
}

export function formatStatus(value) {
  const labels = {
    pending: 'Menunggu',
    active: 'Aktif',
    rejected: 'Ditolak',
    completed: 'Selesai',
    waiting_approval: 'Menunggu verifikasi',
    verified: 'Terverifikasi',
    approved: 'Disetujui',
    not_required: 'Tidak diperlukan',
  };

  return labels[value] || value;
}
