import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

/* ── API Config ─────────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:8080/api/products';

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const CATEGORIES = ['All', 'Pipes', 'Nozzles', 'Valves', 'Fittings'];

const CAT_COLORS = {
  Pipes:    { bg: '#dbeafe', color: '#1d4ed8' },
  Nozzles:  { bg: '#fce7f3', color: '#be185d' },
  Valves:   { bg: '#d1fae5', color: '#065f46' },
  Fittings: { bg: '#fef3c7', color: '#92400e' },
};

function getStatus(stock, minStock) {
  if (stock === 0)          return { label: 'Out of Stock', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', level: 0 };
  if (stock < minStock)     return { label: 'Low Stock',    bg: '#fef9c3', color: '#a16207', dot: '#eab308', level: 1 };
  if (stock < minStock * 2) return { label: 'Moderate',     bg: '#ffedd5', color: '#c2410c', dot: '#f97316', level: 2 };
  return                           { label: 'In Stock',     bg: '#dcfce7', color: '#15803d', dot: '#22c55e', level: 3 };
}

/* Normalise field names from Spring Boot response to what the UI expects */
function normalise(raw) {
  return {
    id:          raw.id,
    product:     raw.product     ?? raw.name        ?? raw.productName  ?? '—',
    category:    raw.category    ?? raw.categoryName ?? '—',
    stock:       Number(raw.stock      ?? raw.quantity     ?? 0),
    minStock:    Number(raw.minStock   ?? raw.minimumStock ?? raw.min_stock ?? 0),
    unit:        raw.unit        ?? raw.unitOfMeasure ?? 'pcs',
    updatedDate: (raw.updatedDate ??raw.lastUpdated ??raw.updatedAt ??raw.updated_at)?.split('T')[0] ?? '—',
  };
}

/* ── StockBar ───────────────────────────────────────────────────────────────── */

function StockBar({ stock, minStock }) {
  const max = Math.max(stock, minStock * 3, 10);
  const pct = Math.min((stock / max) * 100, 100);
  const s   = getStatus(stock, minStock);
  return (
    <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 99, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: s.dot, borderRadius: 99, transition: 'width .4s ease' }} />
    </div>
  );
}

/* ── Add Stock Modal ────────────────────────────────────────────────────────── */

function AddStockModal({ item, onClose, onSave }) {
  const [qty,  setQty]  = useState('');
  const [note, setNote] = useState('');
  const valid = qty !== '' && Number(qty) > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,10,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: 440, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.22)' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(135deg,#15803d,#166534)', padding: '22px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#bbf7d0', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ADD STOCK</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{item.product}</div>
              <div style={{ color: '#86efac', fontSize: 13, marginTop: 3 }}>Current stock: <strong>{item.stock} {item.unit}</strong></div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, letterSpacing: .4 }}>QUANTITY TO ADD ({item.unit})</label>
            <input type="number" min={1} value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 50" autoFocus
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 16, fontWeight: 700, outline: 'none', background: '#f9fafb', color: '#111827', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#16a34a')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            {qty && Number(qty) > 0 && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                New stock will be: <strong>{item.stock + Number(qty)} {item.unit}</strong>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, letterSpacing: .4 }}>NOTE (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Received from supplier"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', background: '#f9fafb',color: '#111827',  boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#16a34a')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#6b7280', fontSize: 14 }}>Cancel</button>
            <button disabled={!valid} onClick={() => { if (valid) { onSave(item.id, Number(qty)); onClose(); } }}
              style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 10, background: valid ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#d1d5db', cursor: valid ? 'pointer' : 'not-allowed', fontWeight: 800, color: '#fff', fontSize: 14 }}>
              + Add {qty || '0'} {item.unit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Adjust Modal ───────────────────────────────────────────────────────────── */

function AdjustModal({ item, onClose, onSave }) {
  const [qty, setQty] = useState('');
  const newQty = item.stock - Number(qty || 0);
  const valid  = qty !== '' && Number(qty) > 0 && Number(qty) <= item.stock;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,10,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: 420, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.22)' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(135deg,#b91c1c,#991b1b)', padding: '22px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fecaca', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>REMOVE STOCK</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{item.product}</div>
              <div style={{ color: '#fca5a5', fontSize: 13, marginTop: 3 }}>Current: <strong>{item.stock} {item.unit}</strong></div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, letterSpacing: .4 }}>QUANTITY TO REMOVE</label>
            <input type="number" min={1} max={item.stock} value={qty} onChange={e => setQty(e.target.value)} placeholder={`Max ${item.stock}`} autoFocus
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 16, fontWeight: 700, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
            {qty && Number(qty) > 0 && Number(qty) <= item.stock && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>
                New stock will be: <strong>{newQty} {item.unit}</strong>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#6b7280' }}>Cancel</button>
            <button disabled={!valid} onClick={() => { if (valid) { onSave(item.id, -Number(qty)); onClose(); } }}
              style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 10, background: valid ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : '#d1d5db', cursor: valid ? 'pointer' : 'not-allowed', fontWeight: 800, color: '#fff', fontSize: 14 }}>
              Remove {qty || '0'} {item.unit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────────────────── */

export default function Inventory() {
  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState('');
  const [category,      setCategory]      = useState('All');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [sortKey,       setSortKey]       = useState('product');
  const [sortDir,       setSortDir]       = useState('asc');
  const [addTarget,     setAddTarget]     = useState(null);
  const [adjustTarget,  setAdjustTarget]  = useState(null);

  /* ── Fetch from Spring Boot ─────────────────────────────────────────────── */

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();
      // Handle both bare array and wrapped responses (Spring Page, etc.)
      const raw = Array.isArray(json)
        ? json
        : (json.data ?? json.content ?? json.items ?? json.products ?? []);
      setItems(raw.map(normalise));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  /* ── Optimistic local stock update + PATCH to backend ───────────────────── */

  const updateStock = async (id, delta) => {
  const item = items.find(i => i.id === id);

  if (!item) return;

  const newStock = Math.max(0, item.stock + delta);

  // Optimistic UI update
  setItems(prev =>
    prev.map(i =>
      i.id === id
        ? {
            ...i,
            stock: newStock,
            updatedDate: new Date().toISOString().slice(0, 10)
          }
        : i
    )
  );

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stock: newStock,
        updatedDate: new Date().toISOString().slice(0, 10)
      })
    });

    if (!response.ok) {
      throw new Error('Update failed');
    }
  } catch (err) {
    console.error(err);
    fetchProducts(); // reload from database if update fails
  }
};

  /* ── Sort ───────────────────────────────────────────────────────────────── */

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }) =>
    sortKey !== k
      ? <span style={{ color: '#d1d5db', marginLeft: 4 }}>⇅</span>
      : <span style={{ color: '#16a34a', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;

  /* ── Filter + sort ──────────────────────────────────────────────────────── */

  const displayed = useMemo(() => {
    let list = items.filter(i => {
      const matchCat    = category === 'All' || i.category === category;
      const matchSearch = i.product.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Out of Stock' && i.stock === 0) ||
        (statusFilter === 'Low Stock'    && i.stock > 0 && i.stock < i.minStock) ||
        (statusFilter === 'In Stock'     && i.stock >= i.minStock);
      return matchCat && matchSearch && matchStatus;
    });
    return [...list].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, search, category, statusFilter, sortKey, sortDir]);

  /* ── Stats ──────────────────────────────────────────────────────────────── */

  const totalItems = items.length;
  const inStock    = items.filter(i => i.stock >= i.minStock).length;
  const lowStock   = items.filter(i => i.stock > 0 && i.stock < i.minStock).length;
  const outOfStock = items.filter(i => i.stock === 0).length;
  const totalUnits = items.reduce((s, i) => s + i.stock, 0);

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap');
        .inv-page * { font-family: 'Geist', 'DM Sans', sans-serif; }
        .inv-page .mono { font-family: 'Geist Mono', 'JetBrains Mono', monospace !important; }
        .inv-row { transition: background .12s; }
        .inv-row:hover { background: #f0fdf4 !important; }
        .inv-row:hover .row-acts { opacity: 1 !important; }
        .row-acts { opacity: 0; transition: opacity .15s; }
        .sort-th { cursor: pointer; user-select: none; white-space: nowrap; }
        .sort-th:hover { background: #f0fdf4; }
        .act-btn { border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .act-btn:hover { opacity: .85; transform: scale(1.03); }
        .cat-chip { padding: 6px 14px; border-radius: 20px; border: 1.5px solid transparent; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .cat-chip.active { background: #15803d; color: #fff; }
        .cat-chip:not(.active) { background: #fff; color: #6b7280; border-color: #e5e7eb; }
        .cat-chip:not(.active):hover { border-color: #16a34a; color: #15803d; }
        .alert-banner { background: linear-gradient(135deg,#fef9c3,#fef3c7); border: 1.5px solid #fde68a; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>

      <div className="inv-page" style={{ padding: '28px 32px', background: '#f8faf8', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 28, color: '#1a2e1a', letterSpacing: -.5 }}>📦 Inventory</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
              {loading
                ? 'Loading from backend…'
                : error
                  ? 'Failed to load — showing error below'
                  : `${totalUnits.toLocaleString()} total units across ${totalItems} products`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Refresh */}
            <button onClick={fetchProducts} disabled={loading}
              style={{ padding: '12px 16px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, color: '#6b7280', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className={loading ? 'spin' : ''}>↻</span>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <Link to="/add-product" style={{ padding: '12px 22px', background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(22,163,74,.3)' }}>
              + Add New Product
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
            <button onClick={fetchProducts} style={{ marginLeft: 'auto', padding: '8px 16px', background: '#b91c1c', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden', marginBottom: 20 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: '1px solid #f9fafb', alignItems: 'center' }}>
                {[200, 100, 60, 60, 120, 90, 80, 100].map((w, j) => (
                  <div key={j} style={{ width: w, height: 14, borderRadius: 6, background: `hsl(0,0%,${93 - i * 1}%)` }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Alert Banner */}
            {(lowStock > 0 || outOfStock > 0) && (
              <div className="alert-banner">
                <span style={{ fontSize: 22 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#92400e', fontSize: 14 }}>Stock Alert</div>
                  <div style={{ fontSize: 13, color: '#a16207', marginTop: 2 }}>
                    {outOfStock > 0 && <span><strong>{outOfStock}</strong> product{outOfStock > 1 ? 's' : ''} out of stock. </span>}
                    {lowStock > 0  && <span><strong>{lowStock}</strong> product{lowStock > 1 ? 's' : ''} running low. </span>}
                    Restock soon to avoid disruptions.
                  </div>
                </div>
              </div>
            )}

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Products',  val: totalItems,  icon: '📦', color: '#1a2e1a', sub: 'in inventory',   click: null          },
                { label: 'In Stock',        val: inStock,     icon: '✅', color: '#15803d', sub: 'above minimum',  click: 'In Stock'    },
                { label: 'Low Stock',       val: lowStock,    icon: '⚠️', color: '#a16207', sub: 'needs attention', click: 'Low Stock'   },
                { label: 'Out of Stock',    val: outOfStock,  icon: '🚫', color: '#b91c1c', sub: 'restock needed',  click: 'Out of Stock'},
              ].map(s => (
                <div key={s.label}
                  onClick={() => s.click && setStatusFilter(statusFilter === s.click ? 'All' : s.click)}
                  style={{ background: statusFilter === s.click ? '#f0fdf4' : '#fff', borderRadius: 16, padding: '20px 22px', border: statusFilter === s.click ? '1.5px solid #86efac' : '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.04)', cursor: s.click ? 'pointer' : 'default', transition: 'all .15s' }}>
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
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                    style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#f9fafb', boxSizing: 'border-box', transition: 'border-color .2s' }}
                    onFocus={e => (e.target.style.borderColor = '#16a34a')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button key={c} className={`cat-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, marginBottom: 12, paddingLeft: 4 }}>
              Showing {displayed.length} of {items.length} items
              {statusFilter !== 'All' && (
                <span style={{ marginLeft: 8, background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>
                  Filter: {statusFilter}
                </span>
              )}
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f8faf8', borderBottom: '2px solid #f0f0f0' }}>
                    {[
                      { label: 'Product',      key: 'product'     },
                      { label: 'Category',     key: 'category'    },
                      { label: 'Stock',        key: 'stock'       },
                      { label: 'Min Stock',    key: 'minStock'    },
                      { label: 'Stock Level',  key: null          },
                      { label: 'Status',       key: null          },
                      { label: 'Last Updated', key: 'updatedDate' },
                      { label: 'Actions',      key: null          },
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
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                      <div style={{ fontWeight: 700 }}>No items match your filters</div>
                    </td></tr>
                  ) : displayed.map((item, i) => {
                    const s  = getStatus(item.stock, item.minStock);
                    const cc = CAT_COLORS[item.category] ?? { bg: '#f1f5f9', color: '#475569' };
                    return (
                      <tr key={item.id} className="inv-row" style={{ borderBottom: '1px solid #f9fafb', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1a2e1a' }}>{item.product}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: cc.bg, color: cc.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{item.category}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="mono" style={{ fontWeight: 800, fontSize: 16, color: s.level === 0 ? '#b91c1c' : s.level === 1 ? '#a16207' : '#1a2e1a' }}>
                            {item.stock}
                          </span>
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>{item.unit}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                          <span className="mono">{item.minStock} {item.unit}</span>
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: 120 }}>
                          <StockBar stock={item.stock} minStock={item.minStock} />
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                            {item.stock === 0 ? 'Empty' : `${Math.round((item.stock / Math.max(item.minStock * 3, item.stock)) * 100)}% of target`}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                            {s.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13 }}>{item.updatedDate}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div className="row-acts" style={{ display: 'flex', gap: 6, opacity: 0 }}>
                            <button className="act-btn" onClick={() => setAddTarget(item)} style={{ background: '#dcfce7', color: '#15803d' }}>+ Add</button>
                            <button className="act-btn" onClick={() => setAdjustTarget(item)} style={{ background: '#fee2e2', color: '#b91c1c' }} disabled={item.stock === 0}>− Remove</button>
                          </div>
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

      {addTarget    && <AddStockModal item={addTarget}    onClose={() => setAddTarget(null)}    onSave={updateStock} />}
      {adjustTarget && <AdjustModal   item={adjustTarget} onClose={() => setAdjustTarget(null)} onSave={updateStock} />}
    </MainLayout>
  );
}