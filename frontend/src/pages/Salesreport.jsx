import { useState, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';

/* ─────────────────────────────────────────────────────────────────────────────
   BACKUP CONFIGURATION
   ── Google Drive uses the Google Picker + Drive REST API (needs OAuth token)
   ── OneDrive  uses Microsoft Graph API
   ── Dropbox   uses Dropbox API v2
   Replace CLIENT IDs with your own app credentials.
───────────────────────────────────────────────────────────────────────────── */
const BACKUP_CONFIG = {
  googleDrive: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/drive.file',
    uploadUrl: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
  },
  oneDrive: {
    clientId: 'YOUR_ONEDRIVE_CLIENT_ID',
    redirectUri: window.location.origin,
    scope: 'files.readwrite',
    authority: 'https://login.microsoftonline.com/common/oauth2/v2.0',
  },
  dropbox: {
    appKey: 'YOUR_DROPBOX_APP_KEY',
    redirectUri: window.location.origin,
  },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .sales-root {
    font-family: 'DM Sans', sans-serif;
    background: #f5f7f4;
    min-height: 100vh;
    padding: 2rem;
    color: #1a1f18;
  }

  .sales-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .sales-title-wrap h2 {
    font-family: 'Outfit', sans-serif;
    font-size: 2.3rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.05em;
    color: #111827;
  }

  .sales-title-wrap p {
    margin-top: 0.45rem;
    color: #6b7280;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .sales-btn {
    border: none;
    background: linear-gradient(135deg, #15803d, #166534);
    color: white;
    padding: 0.85rem 1.4rem;
    border-radius: 14px;
    font-weight: 700;
    font-size: 0.88rem;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 8px 20px rgba(21, 128, 61, 0.18);
    font-family: 'DM Sans', sans-serif;
  }

  .sales-btn:hover { transform: translateY(-2px); }

  /* Backup button */
  .backup-btn {
    border: none;
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    color: white;
    padding: 0.85rem 1.4rem;
    border-radius: 14px;
    font-weight: 700;
    font-size: 0.88rem;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 8px 20px rgba(29, 78, 216, 0.18);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }
  .backup-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(29,78,216,.25); }
  .backup-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* Backup modal overlay */
  .backup-overlay {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,.45);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

  .backup-modal {
    background: #fff;
    border-radius: 28px;
    padding: 2rem;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 30px 60px rgba(0,0,0,.18);
    animation: slideUp .25s ease;
    position: relative;
  }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }

  .modal-close {
    position: absolute; top: 1.1rem; right: 1.2rem;
    border: none; background: #f3f4f6; border-radius: 50%;
    width: 32px; height: 32px; cursor: pointer;
    font-size: 1rem; color: #6b7280; display: flex;
    align-items: center; justify-content: center;
    transition: background .15s;
  }
  .modal-close:hover { background: #e5e7eb; }

  .modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.35rem; font-weight: 800;
    color: #111827; margin: 0 0 .4rem;
  }
  .modal-sub {
    font-size: .87rem; color: #6b7280; margin-bottom: 1.6rem;
  }

  /* Backup format toggle */
  .format-row {
    display: flex; gap: .6rem; margin-bottom: 1.6rem;
  }
  .format-btn {
    flex:1; padding: .65rem .5rem; border-radius: 12px;
    border: 1.5px solid #e5e7eb; background: #f9fafb;
    font-family: 'DM Sans', sans-serif;
    font-size: .82rem; font-weight: 700; cursor: pointer;
    color: #374151; transition: all .15s; text-align: center;
  }
  .format-btn.active {
    background: #f0fdf4; border-color: #16a34a; color: #15803d;
  }
  .format-btn:hover:not(.active) { border-color: #d1fae5; }

  /* Provider cards */
  .provider-grid {
    display: flex; flex-direction: column; gap: .85rem;
    margin-bottom: 1.6rem;
  }

  .provider-card {
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem 1.1rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 18px; background: #fafafa;
    cursor: pointer; transition: all .18s;
  }
  .provider-card:hover {
    border-color: #a5b4fc;
    background: #f5f3ff;
    transform: translateX(3px);
  }
  .provider-card.uploading {
    border-color: #93c5fd;
    background: #eff6ff;
    cursor: not-allowed;
  }
  .provider-card.success {
    border-color: #86efac;
    background: #f0fdf4;
  }
  .provider-card.error {
    border-color: #fca5a5;
    background: #fff1f2;
  }

  .provider-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; flex-shrink: 0;
  }

  .provider-info { flex:1; min-width: 0; }
  .provider-name {
    font-weight: 700; font-size: .95rem; color: #111827;
  }
  .provider-desc {
    font-size: .78rem; color: #6b7280; margin-top: .2rem;
  }
  .provider-status {
    font-size: .75rem; font-weight: 700; padding: .3rem .8rem;
    border-radius: 20px; white-space: nowrap;
  }
  .status-idle    { background: #f3f4f6; color: #6b7280; }
  .status-loading { background: #dbeafe; color: #1d4ed8; }
  .status-success { background: #dcfce7; color: #15803d; }
  .status-error   { background: #fee2e2; color: #b91c1c; }

  /* Progress bar */
  .progress-wrap {
    margin-top: .5rem;
    height: 4px; background: #e5e7eb; border-radius: 99px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: #1d4ed8; border-radius: 99px;
    transition: width .4s ease;
  }

  /* Backup log */
  .backup-log {
    background: #f9fafb; border: 1px solid #e5e7eb;
    border-radius: 14px; padding: 1rem 1.1rem;
    max-height: 120px; overflow-y: auto;
    font-size: .78rem; color: #6b7280;
  }
  .log-entry {
    display: flex; align-items: flex-start; gap: .5rem;
    padding: .25rem 0; border-bottom: 1px solid #f3f4f6;
  }
  .log-entry:last-child { border-bottom: none; }
  .log-time { color: #9ca3af; white-space: nowrap; flex-shrink:0; }
  .log-text.ok { color: #15803d; font-weight: 600; }
  .log-text.err { color: #b91c1c; font-weight: 600; }

  /* Main page styles */
  .sales-card {
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    border-radius: 28px;
    border: 1px solid #e5e7eb;
    padding: 1.7rem;
    margin-bottom: 1.8rem;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  }
  .sales-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem; font-weight: 700;
    margin-bottom: 1.5rem; color: #111827;
  }
  .filter-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; }
  .form-group label { display: block; margin-bottom: .6rem; font-size: .82rem; font-weight: 700; color: #374151; letter-spacing: .02em; }
  .form-control { width:100%; border:1px solid #d1d5db; border-radius:16px; padding:.95rem 1rem; font-size:.92rem; font-family:'DM Sans',sans-serif; background:#f9fafb; transition:all .2s; color:#111827; }
  .form-control:focus { outline:none; border-color:#15803d; background:white; box-shadow:0 0 0 5px rgba(21,128,61,.08); }
  .summary-box { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.6rem; padding:1.2rem 1.4rem; border-radius:22px; background:linear-gradient(135deg,#ecfdf5,#f0fdf4); border:1px solid #bbf7d0; }
  .summary-label { color:#166534; font-weight:700; font-size:.95rem; }
  .summary-value { f font-family: 'Outfit', sans-serif; font-size:1.9rem; font-weight:800; color:#166534; letter-spacing:-.04em; }
  .table-wrap { overflow-x:auto; }
  .sales-table { width:100%; border-collapse:collapse; }
  .sales-table thead th { text-align:left; padding:1rem; font-size:.78rem; text-transform:uppercase; letter-spacing:.08em; color:#6b7280; border-bottom:1px solid #e5e7eb; white-space:nowrap; font-weight:800; }
  .sales-table tbody td { padding:1.1rem 1rem; border-bottom:1px solid #f3f4f6; font-size:.93rem; color:#374151; }
  .sales-table tbody tr { transition:.2s; }
  .sales-table tbody tr:hover { background:#f9fafb; }
  .invoice-id { font-weight:700; color:#111827; }
  .customer-name { font-weight:700; color:#1f2937; }
  .amount { font-weight:800; color:#15803d; font-size:1rem; }
  .badge { display:inline-flex; align-items:center; justify-content:center; padding:.45rem .9rem; border-radius:999px; font-size:.75rem; font-weight:800; }
  .badge-paid { background:#dcfce7; color:#166534; }
  .badge-pending { background:#fee2e2; color:#b91c1c; }
  .action-wrap { display:flex; gap:.7rem; }
  .btn-sm { border:none; border-radius:12px; padding:.65rem 1rem; font-size:.78rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .btn-print { background:#dbeafe; color:#1d4ed8; }
  .btn-return { background:#fef3c7; color:#b45309; }
  .btn-sm:hover { transform:translateY(-2px); }
  @media (max-width:992px) { .filter-grid { grid-template-columns:1fr; } }
  @media (max-width:768px) {
    .sales-root { padding:1rem; }
    .sales-header { flex-direction:column; align-items:flex-start; }
    .summary-box { flex-direction:column; align-items:flex-start; gap:.7rem; }
    .sales-title-wrap h2 { font-size:1.8rem; }
    .header-actions { width:100%; }
  }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin .7s linear infinite;
  }
`;

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
function csvFromSales(sales) {
  const header = ['Invoice', 'Customer', 'Date', 'Total (₹)', 'Status'];
  const rows = sales.map(s => [s.invoice, s.customer, s.date, s.total, s.status]);
  return [header, ...rows].map(r => r.join(',')).join('\n');
}

function jsonFromSales(sales) {
  return JSON.stringify({ exported: new Date().toISOString(), sales }, null, 2);
}

function buildBlob(sales, format) {
  const content = format === 'csv' ? csvFromSales(sales) : jsonFromSales(sales);
  const mime = format === 'csv' ? 'text/csv' : 'application/json';
  return new Blob([content], { type: mime });
}

function nowStr() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── Google Drive Upload ─────────────────────────────────────────────────────── */
async function uploadToGoogleDrive(blob, filename, onProgress) {
  // Step 1: Get OAuth token via Google Identity Services (popup)
  const token = await new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services not loaded. Add <script src="https://accounts.google.com/gsi/client"></script> to your index.html'));
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: BACKUP_CONFIG.googleDrive.clientId,
      scope: BACKUP_CONFIG.googleDrive.scope,
      callback: (resp) => resp.error ? reject(new Error(resp.error)) : resolve(resp.access_token),
    });
    client.requestAccessToken({ prompt: 'consent' });
  });

  onProgress(30);

  // Step 2: Multipart upload
  const metadata = { name: filename, mimeType: blob.type };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  onProgress(60);

  const res = await fetch(BACKUP_CONFIG.googleDrive.uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) throw new Error(`Drive API error: ${res.status} ${res.statusText}`);
  onProgress(100);
  const data = await res.json();
  return data;
}

/* ── OneDrive Upload ─────────────────────────────────────────────────────────── */
async function uploadToOneDrive(blob, filename, onProgress) {
  // Step 1: MSAL-style popup auth
  const authUrl = `${BACKUP_CONFIG.oneDrive.authority}/authorize?`
    + `client_id=${BACKUP_CONFIG.oneDrive.clientId}`
    + `&response_type=token`
    + `&redirect_uri=${encodeURIComponent(BACKUP_CONFIG.oneDrive.redirectUri)}`
    + `&scope=${encodeURIComponent(BACKUP_CONFIG.oneDrive.scope)}`
    + `&response_mode=fragment`;

  const token = await new Promise((resolve, reject) => {
    const popup = window.open(authUrl, 'onedrive_auth', 'width=500,height=600');
    const timer = setInterval(() => {
      try {
        if (popup.closed) { clearInterval(timer); reject(new Error('Auth popup closed')); return; }
        const hash = popup.location.hash;
        if (hash && hash.includes('access_token')) {
          clearInterval(timer);
          popup.close();
          const params = new URLSearchParams(hash.replace('#', ''));
          resolve(params.get('access_token'));
        }
      } catch (_) {}
    }, 500);
  });

  onProgress(40);

  const arrayBuffer = await blob.arrayBuffer();
  onProgress(65);

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/root:/SalesBackups/${filename}:/content`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': blob.type,
      },
      body: arrayBuffer,
    }
  );

  if (!res.ok) throw new Error(`OneDrive API error: ${res.status} ${res.statusText}`);
  onProgress(100);
  return await res.json();
}

/* ── Dropbox Upload ──────────────────────────────────────────────────────────── */
async function uploadToDropbox(blob, filename, onProgress) {
  const authUrl = `https://www.dropbox.com/oauth2/authorize?`
    + `client_id=${BACKUP_CONFIG.dropbox.appKey}`
    + `&response_type=token`
    + `&redirect_uri=${encodeURIComponent(BACKUP_CONFIG.dropbox.redirectUri)}`;

  const token = await new Promise((resolve, reject) => {
    const popup = window.open(authUrl, 'dropbox_auth', 'width=500,height=600');
    const timer = setInterval(() => {
      try {
        if (popup.closed) { clearInterval(timer); reject(new Error('Auth popup closed')); return; }
        const hash = popup.location.hash;
        if (hash && hash.includes('access_token')) {
          clearInterval(timer);
          popup.close();
          const params = new URLSearchParams(hash.replace('#', ''));
          resolve(params.get('access_token'));
        }
      } catch (_) {}
    }, 500);
  });

  onProgress(40);
  const arrayBuffer = await blob.arrayBuffer();
  onProgress(65);

  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: `/SalesBackups/${filename}`,
        mode: 'overwrite',
        autorename: true,
      }),
    },
    body: arrayBuffer,
  });

  if (!res.ok) throw new Error(`Dropbox API error: ${res.status} ${res.statusText}`);
  onProgress(100);
  return await res.json();
}

/* ── Backup Modal ────────────────────────────────────────────────────────────── */
const PROVIDERS = [
  {
    id: 'googleDrive',
    name: 'Google Drive',
    desc: 'Upload to your Google Drive — SalesBackups folder',
    icon: '🟢',
    color: '#f0fdf4',
    upload: uploadToGoogleDrive,
  },
  {
    id: 'oneDrive',
    name: 'OneDrive',
    desc: 'Upload to Microsoft OneDrive — SalesBackups folder',
    icon: '🔵',
    color: '#eff6ff',
    upload: uploadToOneDrive,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    desc: 'Upload to your Dropbox — SalesBackups folder',
    icon: '📦',
    color: '#f5f3ff',
    upload: uploadToDropbox,
  },
];

function BackupModal({ sales, onClose }) {
  const [format, setFormat] = useState('csv');
  const [providerState, setProviderState] = useState({});  // { providerId: { status, progress, msg } }
  const [log, setLog] = useState([]);

  const setPS = (id, patch) =>
    setProviderState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));

  const addLog = (text, type = 'ok') =>
    setLog(prev => [{ time: nowStr(), text, type }, ...prev].slice(0, 30));

  const filename = () => {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    return `sales_backup_${stamp}.${format}`;
  };

  const handleDownloadLocal = () => {
    const blob = buildBlob(sales, format);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename();
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Downloaded locally: ${filename()}`);
  };

  const handleUpload = async (provider) => {
    const ps = providerState[provider.id];
    if (ps?.status === 'loading') return;

    setPS(provider.id, { status: 'loading', progress: 5, msg: 'Connecting…' });
    addLog(`Starting backup to ${provider.name}…`, 'ok');

    try {
      const blob = buildBlob(sales, format);
      const name = filename();
      setPS(provider.id, { status: 'loading', progress: 10, msg: 'Authorizing…' });

      await provider.upload(blob, name, (pct) => {
        setPS(provider.id, {
          status: 'loading', progress: pct,
          msg: pct < 40 ? 'Authorizing…' : pct < 80 ? 'Uploading…' : 'Finalizing…',
        });
      });

      setPS(provider.id, { status: 'success', progress: 100, msg: `Saved as ${name}` });
      addLog(`✓ Backed up to ${provider.name}: ${name}`, 'ok');
    } catch (err) {
      setPS(provider.id, { status: 'error', progress: 0, msg: err.message });
      addLog(`✗ ${provider.name} failed: ${err.message}`, 'err');
    }
  };

  return (
    <div className="backup-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="backup-modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ marginBottom: '.3rem', fontSize: '1.6rem' }}>☁️</div>
        <div className="modal-title">Backup Sales Data</div>
        <div className="modal-sub">
          Choose a format and upload to your cloud storage, or download locally.
        </div>

        {/* Format */}
        <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#6b7280', marginBottom: '.6rem', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          Export Format
        </div>
        <div className="format-row">
          {[
            { id: 'csv',  label: '📊 CSV',  sub: 'Excel compatible' },
            { id: 'json', label: '🗂 JSON', sub: 'Developer friendly' },
          ].map(f => (
            <button
              key={f.id}
              className={`format-btn ${format === f.id ? 'active' : ''}`}
              onClick={() => setFormat(f.id)}
            >
              <div>{f.label}</div>
              <div style={{ fontSize: '.72rem', fontWeight: 500, color: '#9ca3af', marginTop: '.2rem' }}>{f.sub}</div>
            </button>
          ))}
        </div>

        {/* Providers */}
        <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#6b7280', marginBottom: '.6rem', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          Upload to Cloud
        </div>
        <div className="provider-grid">
          {PROVIDERS.map(p => {
            const ps = providerState[p.id] || { status: 'idle', progress: 0, msg: 'Click to connect & upload' };
            return (
              <div
                key={p.id}
                className={`provider-card ${ps.status === 'loading' ? 'uploading' : ps.status === 'success' ? 'success' : ps.status === 'error' ? 'error' : ''}`}
                onClick={() => handleUpload(p)}
                style={{ background: ps.status === 'idle' ? p.color : undefined }}
              >
                <div className="provider-icon" style={{ background: 'rgba(255,255,255,.7)' }}>
                  {p.icon}
                </div>
                <div className="provider-info">
                  <div className="provider-name">{p.name}</div>
                  <div className="provider-desc">
                    {ps.status !== 'idle' ? ps.msg : p.desc}
                  </div>
                  {ps.status === 'loading' && (
                    <div className="progress-wrap">
                      <div className="progress-fill" style={{ width: `${ps.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className={`provider-status status-${ps.status}`}>
                  {ps.status === 'idle'    && '→ Upload'}
                  {ps.status === 'loading' && <><span className="spinner" /> {ps.progress}%</>}
                  {ps.status === 'success' && '✓ Done'}
                  {ps.status === 'error'   && '✗ Failed'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Download local */}
        <button
          onClick={handleDownloadLocal}
          style={{
            width: '100%', padding: '.8rem', border: '1.5px solid #e5e7eb',
            borderRadius: 14, background: '#f9fafb', cursor: 'pointer',
            fontWeight: 700, fontSize: '.88rem', color: '#374151',
            fontFamily: 'DM Sans, sans-serif', transition: 'all .15s',
            marginBottom: log.length ? '1rem' : '0',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#15803d'; e.target.style.background = '#f0fdf4'; }}
          onMouseLeave={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
        >
          ⬇ Download Locally ({format.toUpperCase()})
        </button>

        {/* Log */}
        {log.length > 0 && (
          <div className="backup-log">
            {log.map((entry, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">{entry.time}</span>
                <span className={`log-text ${entry.type}`}>{entry.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────────── */
function SalesReport() {
  const salesHistory = [
    { id: 1, invoice: 'INV-1001', customer: 'Ramesh', date: '20-05-2026', total: 2500, status: 'Paid'    },
    { id: 2, invoice: 'INV-1002', customer: 'Suresh', date: '19-05-2026', total: 1800, status: 'Paid'    },
    { id: 3, invoice: 'INV-1003', customer: 'Mahesh', date: '18-05-2026', total: 3200, status: 'Pending' },
  ];

  const [search,          setSearch]          = useState('');
  const [customerFilter,  setCustomerFilter]  = useState('');
  const [dateFilter,      setDateFilter]      = useState('');
  const [showBackup,      setShowBackup]      = useState(false);

  const filteredSales = salesHistory.filter(sale => {
    const matchesSearch   = sale.invoice.toLowerCase().includes(search.toLowerCase()) || sale.customer.toLowerCase().includes(search.toLowerCase());
    const matchesCustomer = customerFilter === '' || sale.customer === customerFilter;
    const matchesDate     = dateFilter === '' || sale.date === dateFilter;
    return matchesSearch && matchesCustomer && matchesDate;
  });

  const totalSales = filteredSales.reduce((t, s) => t + s.total, 0);

  const handlePrint  = inv => { alert(`Printing Invoice: ${inv}`); window.print(); };
  const handleReturn = inv => alert(`Return initiated for ${inv}`);

  return (
    <MainLayout>
      <style>{styles}</style>

      <div className="sales-root">

        {/* Header */}
        <div className="sales-header">
          <div className="sales-title-wrap">
            <h2>📊 Sales Report</h2>
            <p>Track invoices, payments and customer sales history</p>
          </div>

          <div className="header-actions">
            {/* Backup button */}
            <button className="backup-btn" onClick={() => setShowBackup(true)}>
              ☁️ Backup Data
            </button>

            {/* Export */}
            <button className="sales-btn">
              + Export Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="sales-card">
          <div className="sales-card-title">Search & Filters</div>
          <div className="filter-grid">
            <div className="form-group">
              <label>Search Invoice</label>
              <input type="text" className="form-control" placeholder="Search invoice or customer" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Filter by Customer</label>
              <select className="form-control" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}>
                <option value="">All Customers</option>
                <option value="Ramesh">Ramesh</option>
                <option value="Suresh">Suresh</option>
                <option value="Mahesh">Mahesh</option>
              </select>
            </div>
            <div className="form-group">
              <label>Filter by Date</label>
              <input type="text" className="form-control" placeholder="DD-MM-YYYY" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="sales-card">
          <div className="summary-box">
            <div className="summary-label">Total Sales Amount</div>
            <div className="summary-value">₹ {totalSales.toLocaleString('en-IN')}</div>
          </div>

          <div className="table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td className="invoice-id">{sale.invoice}</td>
                    <td className="customer-name">{sale.customer}</td>
                    <td>{sale.date}</td>
                    <td className="amount">₹ {sale.total.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={sale.status === 'Paid' ? 'badge badge-paid' : 'badge badge-pending'}>
                        {sale.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-wrap">
                        <button className="btn-sm btn-print" onClick={() => handlePrint(sale.invoice)}>Print</button>
                        <button className="btn-sm btn-return" onClick={() => handleReturn(sale.invoice)}>Return</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Backup Modal */}
      {showBackup && (
        <BackupModal
          sales={filteredSales}
          onClose={() => setShowBackup(false)}
        />
      )}
    </MainLayout>
  );
}

export default SalesReport;