import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

/* ── API Config ─────────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:8080/api/transactions';

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const TYPES = ['All', 'Stock In', 'Stock Out'];

function getTypeStyle(type) {
  return type === 'Stock In'
    ? { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', icon: '↑', sign: '+' }
    : { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', icon: '↓', sign: '−' };
}

/* Normalise field names from Spring Boot response to what the UI expects */
function normalise(raw) {
  const qty = Number(raw.quantity ?? raw.qty ?? raw.amount ?? 0);
  return {
    id:            raw.id,
    product:       raw.product      ?? raw.productName ?? raw.name        ?? '—',
    category:      raw.category     ?? raw.categoryName ?? '—',
    type:          (raw.type ?? raw.transactionType ?? (qty >= 0 ? 'IN' : 'OUT'))
                      .toString().toUpperCase().includes('IN') ? 'Stock In' : 'Stock Out',
    quantity:      Math.abs(qty),
    unit:          raw.unit         ?? raw.unitOfMeasure ?? 'pcs',
    previousStock: Number(raw.previousStock ?? raw.prevStock ?? raw.before ?? 0),
    newStock:      Number(raw.newStock      ?? raw.currentStock ?? raw.after ?? 0),
    note:          raw.note         ?? raw.remarks ?? raw.notes ?? '',
    performedBy:   raw.performedBy  ?? raw.user ?? raw.createdBy ?? raw.updatedBy ?? 'System',
    timestamp:     raw.timestamp    ?? raw.createdAt ?? raw.updatedAt ?? raw.date ?? null,
  };
}

function formatDateTime(iso) {
  if (!iso) return { date: '—', time: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: iso.split('T')[0] ?? '—', time: '' };
  return {
    date: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  };
}

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

/* ── Transaction Detail Modal ───────────────────────────────────────────────── */

function DetailModal({ txn, onClose }) {
  const s = getTypeStyle(txn.type);
  const { date, time } = formatDateTime(txn.timestamp);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,10,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: 440, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.22)' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: txn.type === 'Stock In' ? 'linear-gradient(135deg,#15803d,#166534)' : 'linear-gradient(135deg,#b91c1c,#991b1b)', padding: '22px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', opacity: .8, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{txn.type.toUpperCase()}</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{txn.product}</div>
              <div style={{ color: '#fff', opacity: .85, fontSize: 13, marginTop: 3 }}>{date} · {time}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>BEFORE</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1a2e1a', marginTop: 4 }}>{txn.previousStock}</div>
            </div>
            <div style={{ background: s.bg, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>CHANGE</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.sign}{txn.quantity}</div>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>AFTER</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1a2e1a', marginTop: 4 }}>{txn.newStock}</div>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>PERFORMED BY</div>
            <div style={{ fontSize: 14, color: '#1a2e1a', fontWeight: 600 }}>{txn.performedBy}</div>
          </div>
          {txn.note && (
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>NOTE</div>
              <div style={{ fontSize: 14, color: '#374151', background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>{txn.note}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────────────────── */

export default function Transactions() {
  const [txns,         setTxns]         = useState([]);
  const [loading,       setLoading]     = useState(true);
  const [error,         setError]       = useState(null);
  const [search,        setSearch]      = useState('');
  const [typeFilter,    setTypeFilter]  = useState('All');
  const [dateFilter,    setDateFilter]  = useState('All');
  const [sortKey,       setSortKey]     = useState('timestamp');
  const [sortDir,       setSortDir]     = useState('desc');
  const [detailTarget,  setDetailTarget] = useState(null);

  /* ── Fetch from Spring Boot ─────────────────────────────────────────────── */

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();
      const raw = Array.isArray(json)
        ? json
        : (json.data ?? json.content ?? json.items ?? json.transactions ?? []);
      setTxns(raw.map(normalise));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  /* ── Sort ───────────────────────────────────────────────────────────────── */

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }) =>
    sortKey !== k
      ? <span style={{ color: '#d1d5db', marginLeft: 4 }}>⇅</span>
      : <span style={{ color: '#16a34a', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;

  /* ── Filter + sort ──────────────────────────────────────────────────────── */

  const displayed = useMemo(() => {
    let list = txns.filter(t => {
      const matchType   = typeFilter === 'All' || t.type === typeFilter;
      const matchSearch = t.product.toLowerCase().includes(search.toLowerCase()) ||
                           t.performedBy.toLowerCase().includes(search.toLowerCase());
      const matchDate    = dateFilter === 'All' || (dateFilter === 'Today' && isToday(t.timestamp));
      return matchType && matchSearch && matchDate;
    });
    return [...list].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      let cmp;
      if (sortKey === 'timestamp') cmp = new Date(av || 0) - new Date(bv || 0);
      else cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [txns, search, typeFilter, dateFilter, sortKey, sortDir]);

  /* ── Stats ──────────────────────────────────────────────────────────────── */

  const totalTxns   = txns.length;
  const stockIn     = txns.filter(t => t.type === 'Stock In').length;
  const stockOut    = txns.filter(t => t.type === 'Stock Out').length;
  const todayCount  = txns.filter(t => isToday(t.timestamp)).length;

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap');
        .txn-page * { font-family: 'Geist', 'DM Sans', sans-serif; }
        .txn-page .mono { font-family: 'Geist Mono', 'JetBrains Mono', monospace !important; }
        .txn-row { transition: background .12s; cursor: pointer; }
        .txn-row:hover { background: #f0fdf4 !important; }
        .sort-th { cursor: pointer; user-select: none; white-space: nowrap; }
        .sort-th:hover { background: #f0fdf4; }
        .chip { padding: 6px 14px; border-radius: 20px; border: 1.5px solid transparent; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .chip.active { background: #15803d; color: #fff; }
        .chip:not(.active) { background: #fff; color: #6b7280; border-color: #e5e7eb; }
        .chip:not(.active):hover { border-color: #16a34a; color: #15803d; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>

      <div className="txn-page" style={{ padding: '28px 32px', background: '#f8faf8', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 28, color: '#1a2e1a', letterSpacing: -.5 }}>🧾 Recent Transactions</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
              {loading
                ? 'Loading from backend…'
                : error
                  ? 'Failed to load — showing error below'
                  : `${totalTxns.toLocaleString()} transactions recorded`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchTransactions} disabled={loading}
              style={{ padding: '12px 16px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, color: '#6b7280', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className={loading ? 'spin' : ''}>↻</span>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <Link to="/inventory" style={{ padding: '12px 22px', background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(22,163,74,.3)' }}>
              📦 Go to Inventory
            </Link>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 800, color: '#b91c1c', fontSize: 14 }}>Could not reach backend</div>
              <div style={{ fontSize: 13, color: '#dc2626', marginTop: 2 }}>{error}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                Make sure Spring Boot is running at <code style={{ background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>{API_BASE}</code>
              </div>
            </div>
            <button onClick={fetchTransactions} style={{ marginLeft: 'auto', padding: '8px 16px', background: '#b91c1c', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden', marginBottom: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: '1px solid #f9fafb', alignItems: 'center' }}>
                {[180, 90, 70, 70, 110, 100, 90].map((w, j) => (
                  <div key={j} style={{ width: w, height: 14, borderRadius: 6, background: `hsl(0,0%,${93 - i * 1}%)` }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Transactions', val: totalTxns,  icon: '🧾', color: '#1a2e1a', sub: 'all time',       click: 'All'       },
                { label: 'Stock In',           val: stockIn,    icon: '↑',  color: '#15803d', sub: 'restocks',       click: 'Stock In'  },
                { label: 'Stock Out',          val: stockOut,   icon: '↓',  color: '#b91c1c', sub: 'removals',       click: 'Stock Out' },
                { label: 'Today',              val: todayCount, icon: '📅', color: '#a16207', sub: 'transactions',   click: null        },
              ].map(s => (
                <div key={s.label}
                  onClick={() => s.click && setTypeFilter(typeFilter === s.click ? 'All' : s.click)}
                  style={{ background: typeFilter === s.click && s.click !== 'All' ? '#f0fdf4' : '#fff', borderRadius: 16, padding: '20px 22px', border: typeFilter === s.click && s.click !== 'All' ? '1.5px solid #86efac' : '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.04)', cursor: s.click ? 'pointer' : 'default', transition: 'all .15s' }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginTop: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1.5px solid #e5e7eb', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product or user…"
                    style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#f9fafb', boxSizing: 'border-box', transition: 'border-color .2s' }}
                    onFocus={e => (e.target.style.borderColor = '#16a34a')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TYPES.map(t => (
                    <button key={t} className={`chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['All', 'Today'].map(d => (
                    <button key={d} className={`chip ${dateFilter === d ? 'active' : ''}`} onClick={() => setDateFilter(d)}>{d}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, marginBottom: 12, paddingLeft: 4 }}>
              Showing {displayed.length} of {txns.length} transactions
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f8faf8', borderBottom: '2px solid #f0f0f0' }}>
                    {[
                      { label: 'Product',      key: 'product'   },
                      { label: 'Type',         key: 'type'      },
                      { label: 'Quantity',     key: 'quantity'  },
                      { label: 'Before → After', key: null      },
                      { label: 'Performed By', key: 'performedBy' },
                      { label: 'Note',         key: null        },
                      { label: 'Date & Time',  key: 'timestamp' },
                    ].map(col => (
                      <th key={col.label}
                        className={col.key ? 'sort-th' : ''}
                        onClick={() => col.key && handleSort(col.key)}
                        style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: '#6b7280', letterSpacing: .4 }}>
                        {col.label}{col.key && <SortIcon k={col.key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                      <div style={{ fontWeight: 700 }}>No transactions match your filters</div>
                    </td></tr>
                  ) : displayed.map((t, i) => {
                    const s = getTypeStyle(t.type);
                    const { date, time } = formatDateTime(t.timestamp);
                    return (
                      <tr key={t.id} className="txn-row" onClick={() => setDetailTarget(t)}
                        style={{ borderBottom: '1px solid #f9fafb', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1a2e1a' }}>{t.product}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                            {t.type}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="mono" style={{ fontWeight: 800, fontSize: 16, color: s.color }}>
                            {s.sign}{t.quantity}
                          </span>
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>{t.unit}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                          <span className="mono">{t.previousStock} → {t.newStock}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#374151' }}>{t.performedBy}</td>
                        <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.note || '—'}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>
                          <div>{date}</div>
                          <div style={{ fontSize: 11, color: '#d1d5db' }}>{time}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {detailTarget && <DetailModal txn={detailTarget} onClose={() => setDetailTarget(null)} />}
    </MainLayout>
  );
}