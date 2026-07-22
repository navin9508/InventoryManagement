import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout';

/* ── Config ─────────────────────────────────────────────────────────────────── */
const BASE_URL = 'http://localhost:8080';


/* ── Normalize: map backend field names → component field names ─────────────
   Adjust the keys here if your Spring Boot entity uses different names.       */
function normalizeCustomer(c) {
  return {
    id: c.customerId,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    gstin: c.gstin ?? c.gstIn ?? '',
    joinedDate: c.joinedDate ?? c.joinDate ?? c.createdAt ?? '',
    invoices: (c.invoices ?? c.invoiceList ?? []).map(normalizeInvoice),
  };
}

function normalizeInvoice(inv) {
  return {
    id: inv.id,
    date: inv.date ?? inv.invoiceDate ?? '',
    status: inv.status,
    paidDate: inv.paidDate ?? inv.paymentDate ?? null,
    items: (inv.items ?? inv.lineItems ?? []).map(normalizeItem),
  };
}

function normalizeItem(item) {
  return {
    name: item.name ?? item.itemName ?? '',
    qty: item.qty ?? item.quantity ?? 0,
    price: item.price ?? item.unitPrice ?? 0,
    gst: item.gst ?? item.gstPercent ?? item.taxRate ?? 0,
  };
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function calcInvoice(invoice) {
  const subtotal = invoice.items.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = invoice.items.reduce((s, i) => s + (i.price * i.qty * i.gst) / 100, 0);
  return { subtotal, gst, grand: subtotal + gst };
}

function statusStyle(status) {
  switch (status) {
    case 'Paid': return { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' };
    case 'Pending': return { bg: '#fef9c3', color: '#a16207', dot: '#eab308' };
    case 'Overdue': return { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' };
    default: return { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  }
}

function Badge({ status }) {
  const s = statusStyle(status);
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 700, display: 'inline-flex',
      alignItems: 'center', gap: 5,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}

/* ── Loading Spinner ────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, paddingTop: 80 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3.5px solid #dcfce7',
        borderTopColor: '#16a34a',
        animation: 'spin 0.75s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>Loading customers…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Error Banner ───────────────────────────────────────────────────────────── */
function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      margin: '20px 24px',
      background: '#fff1f2', border: '1.5px solid #fecaca',
      borderRadius: 12, padding: '16px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div>
        <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: 14 }}>⚠ Could not reach backend</div>
        <div style={{ fontSize: 12, color: '#9b1c1c', marginTop: 4 }}>{message}</div>
      </div>
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px', background: '#b91c1c', color: '#fff',
          border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >Retry</button>
    </div>
  );
}

/* ── Modal ─────────────────────────────────────────────────────────────────── */
function CustomerModal({ customer, onClose, onSave }) {
  const blank = { id: Date.now(), name: '', phone: '', email: '', address: '', gstin: '', joinedDate: new Date().toISOString().slice(0, 10), invoices: [] };
  const [form, setForm] = useState(customer ?? blank);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, padding: 32, width: 520,
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h5 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#1a2e1a' }}>
            {customer ? 'Edit Customer' : 'Add Customer'}
          </h5>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        {[
          { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Customer full name' },
          { label: 'Phone', key: 'phone', type: 'text', placeholder: '+91 XXXXX XXXXX' },
          { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
          { label: 'GSTIN', key: 'gstin', type: 'text', placeholder: '33XXXXX0000X1X0' },
          { label: 'Joined Date', key: 'joinedDate', type: 'date', placeholder: '' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 6 }}>{label}</label>
            <input
              type={type}
              value={form[key]}
              placeholder={placeholder}
              onChange={e => set(key, e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1.5px solid #d1fae5', fontSize: 14, outline: 'none',
                background: '#f9fafb', boxSizing: 'border-box',
                transition: 'border-color .2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#16a34a')}
              onBlur={e => (e.target.style.borderColor = '#d1fae5')}
            />
          </div>
        ))}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 6 }}>Address</label>
          <textarea
            rows={2}
            value={form.address}
            placeholder="Full address"
            onChange={e => set('address', e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1.5px solid #d1fae5', fontSize: 14, outline: 'none',
              background: '#f9fafb', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', border: '1.5px solid #e5e7eb',
            borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#6b7280',
          }}>Cancel</button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            style={{
              flex: 1, padding: '11px 0', border: 'none',
              borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#15803d)',
              cursor: 'pointer', fontWeight: 700, color: '#fff', fontSize: 14,
            }}
          >
            {customer ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Invoice Detail Modal ──────────────────────────────────────────────────── */
function InvoiceModal({ invoice, customerName, onClose, onMarkPaid }) {
  const { subtotal, gst, grand } = calcInvoice(invoice);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, width: 560, maxHeight: '90vh',
          overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ background: 'linear-gradient(135deg,#15803d,#166534)', padding: '24px 28px', borderRadius: '16px 16px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#bbf7d0', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>INVOICE</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{invoice.id}</div>
              <div style={{ color: '#86efac', fontSize: 13, marginTop: 4 }}>{customerName}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <div>
              <div style={{ color: '#86efac', fontSize: 11, fontWeight: 600 }}>DATE</div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{invoice.date}</div>
            </div>
            <div>
              <div style={{ color: '#86efac', fontSize: 11, fontWeight: 600 }}>STATUS</div>
              <Badge status={invoice.status} />
            </div>
            {invoice.paidDate && (
              <div>
                <div style={{ color: '#86efac', fontSize: 11, fontWeight: 600 }}>PAID ON</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{invoice.paidDate}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0fdf4' }}>
                {['Item', 'Qty', 'Unit Price', 'GST%', 'Total'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Item' ? 'left' : 'right', padding: '8px 6px', color: '#6b7280', fontWeight: 700, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => {
                const lineTotal = item.price * item.qty * (1 + item.gst / 100);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '10px 6px', fontWeight: 600, color: '#1a2e1a' }}>{item.name}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: '#374151' }}>{item.qty}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: '#374151' }}>₹{item.price}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: '#374151' }}>{item.gst}%</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>₹{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 20, borderTop: '2px solid #f0fdf4', paddingTop: 16 }}>
            {[
              { label: 'Subtotal', val: subtotal },
              { label: 'GST', val: gst },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
                <span>{r.label}</span>
                <span style={{ fontWeight: 600 }}>₹{r.val.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#1a2e1a' }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: 17, color: '#15803d' }}>₹{grand.toFixed(2)}</span>
            </div>
          </div>

          {invoice.status !== 'Paid' && (
            <button
              onClick={() => { onMarkPaid(invoice.id); onClose(); }}
              style={{
                marginTop: 20, width: '100%', padding: '12px 0',
                background: 'linear-gradient(135deg,#16a34a,#15803d)',
                border: 'none', borderRadius: 10, color: '#fff',
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
              }}
            >✓ Mark as Paid</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────────── */
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);       // error message string | null
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Fetch from Spring Boot ── */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/customers`);
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
      const json = await res.json();
      setCustomers(json.map(normalizeCustomer));
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setFetchError(err.message);
      setCustomers([]); // no fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  const selected = customers.find(c => c.id === selectedId) ?? null;

  /* ── Mutations ── */
  const saveCustomer = (form) => {
    setCustomers(prev => {
      const exists = prev.find(c => c.id === form.id);
      return exists
        ? prev.map(c => c.id === form.id ? { ...c, ...form } : c)
        : [...prev, { ...form, invoices: [] }];
    });
    if (!editCustomer) setSelectedId(form.id);
    setEditCustomer(null);
  };

  const deleteCustomer = (id) => {
    if (!window.confirm('Delete this customer?')) return;
    setCustomers(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const markPaid = (customerId, invoiceId) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId
        ? {
          ...c,
          invoices: c.invoices.map(inv =>
            inv.id === invoiceId
              ? { ...inv, status: 'Paid', paidDate: new Date().toISOString().slice(0, 10) }
              : inv
          ),
        }
        : c
    ));
  };

  /* ── Stats for selected customer ── */
  const stats = selected ? (() => {
    const all = selected.invoices;
    const paid = all.filter(i => i.status === 'Paid');
    const totalBilled = all.reduce((s, i) => s + calcInvoice(i).grand, 0);
    const totalPaid = paid.reduce((s, i) => s + calcInvoice(i).grand, 0);
    const totalDue = totalBilled - totalPaid;
    return { totalBilled, totalPaid, totalDue, invoiceCount: all.length, paidCount: paid.length };
  })() : null;

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .cust-page * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .cust-row { transition: background .15s, box-shadow .15s; cursor: pointer; }
        .cust-row:hover { background: #f0fdf4 !important; }
        .cust-row.active { background: #dcfce7 !important; border-left: 3px solid #16a34a !important; }
        .tab-btn { border: none; background: none; padding: 10px 18px; cursor: pointer; font-weight: 700; font-size: 13px; color: #6b7280; border-bottom: 2px solid transparent; transition: all .2s; }
        .tab-btn.active { color: #15803d; border-bottom-color: #15803d; }
        .inv-card { border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 12px; transition: box-shadow .15s, border-color .15s; cursor: pointer; }
        .inv-card:hover { box-shadow: 0 4px 16px rgba(22,163,74,.12); border-color: #86efac; }
        .stat-card { background: #fff; border-radius: 14px; padding: 20px; border: 1.5px solid #e5e7eb; }
        .action-btn { border: none; padding: 7px 14px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; transition: opacity .15s; }
        .action-btn:hover { opacity: .85; }
        .empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cust-page" style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ width: 320, minWidth: 320, borderRight: '1.5px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search customers…"
                  style={{
                    width: '100%', padding: '9px 12px 9px 32px',
                    border: '1.5px solid #e5e7eb', borderRadius: 10,
                    fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                onClick={() => { setEditCustomer(null); setShowAddModal(true); }}
                style={{
                  padding: '9px 14px', background: 'linear-gradient(135deg,#16a34a,#15803d)',
                  border: 'none', borderRadius: 10, color: '#fff', fontWeight: 800,
                  fontSize: 18, cursor: 'pointer', lineHeight: 1,
                }}
                title="Add Customer"
              >+</button>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
              {loading ? 'Loading…' : `${filtered.length} customer${filtered.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <Spinner />
            ) : filtered.length === 0 ? (
              <div className="empty-state">No customers found</div>
            ) : filtered.map(c => {
              const pendingCount = c.invoices.filter(i => i.status !== 'Paid').length;
              return (
                <div
                  key={c.id}
                  className={`cust-row ${selectedId === c.id ? 'active' : ''}`}
                  style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', borderLeft: '3px solid transparent' }}
                  onClick={() => { setSelectedId(c.id); setActiveTab('overview'); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#bbf7d0,#86efac)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#15803d', fontSize: 15, flexShrink: 0,
                    }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2e1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{c.phone}</div>
                    </div>
                    {pendingCount > 0 && (
                      <span style={{ background: '#fef9c3', color: '#a16207', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>
                        {pendingCount} due
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#f8faf8' }}>

          {/* Error banner (shown above content when API failed but fallback loaded) */}
          {fetchError && !loading && (
            <ErrorBanner message={fetchError} onRetry={fetchCustomers} />
          )}

          {!selected ? (
            <div className="empty-state" style={{ paddingTop: 120 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Select a customer</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Click any customer from the list to view details</div>
            </div>
          ) : (
            <div style={{ padding: '28px 32px', maxWidth: 860 }}>

              {/* Customer Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#16a34a,#15803d)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: '#fff', fontSize: 22,
                  }}>{selected.name.charAt(0)}</div>
                  <div>
                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: '#1a2e1a' }}>{selected.name}</h2>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                      Customer since {selected.joinedDate ? new Date(selected.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="action-btn" onClick={() => { setEditCustomer(selected); setShowAddModal(true); }}
                    style={{ background: '#f0fdf4', color: '#15803d', border: '1.5px solid #86efac' }}>✏️ Edit</button>
                  <button className="action-btn" onClick={() => deleteCustomer(selected.id)}
                    style={{ background: '#fff1f2', color: '#b91c1c', border: '1.5px solid #fecaca' }}>🗑 Delete</button>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Total Billed', val: `₹${stats.totalBilled.toFixed(2)}`, icon: '📋', color: '#1a2e1a' },
                  { label: 'Total Paid', val: `₹${stats.totalPaid.toFixed(2)}`, icon: '✅', color: '#15803d' },
                  { label: 'Balance Due', val: `₹${stats.totalDue.toFixed(2)}`, icon: '⏳', color: stats.totalDue > 0 ? '#b91c1c' : '#15803d' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: 24, display: 'flex' }}>
                {['overview', 'invoices', 'payments'].map(t => (
                  <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                    {{ overview: '📄 Overview', invoices: '🧾 Invoices', payments: '💰 Payments' }[t]}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {[
                    { label: 'Phone', val: selected.phone, icon: '📞' },
                    { label: 'Email', val: selected.email, icon: '📧' },
                    { label: 'GSTIN', val: selected.gstin || '—', icon: '🏢' },
                    { label: 'Address', val: selected.address, icon: '📍' },
                  ].map(f => (
                    <div key={f.label} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px 18px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 6 }}>{f.icon} {f.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2e1a' }}>{f.val}</div>
                    </div>
                  ))}
                  <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 6 }}>🧾 Invoices</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2e1a' }}>{stats.invoiceCount} total · {stats.paidCount} paid</div>
                  </div>
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div>
                  {selected.invoices.length === 0 ? (
                    <div className="empty-state">No invoices yet</div>
                  ) : selected.invoices.map(inv => {
                    const { grand } = calcInvoice(inv);
                    return (
                      <div key={inv.id} className="inv-card" onClick={() => setViewInvoice({ inv, cid: selected.id })}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: '#1a2e1a' }}>{inv.id}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{inv.date} · {inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: 17, color: '#15803d', marginBottom: 6 }}>₹{grand.toFixed(2)}</div>
                            <Badge status={inv.status} />
                          </div>
                        </div>
                        {inv.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginTop: 8, paddingTop: i === 0 ? 10 : 0, borderTop: i === 0 ? '1px solid #f0f0f0' : 'none' }}>
                            <span>{item.name} × {item.qty}</span>
                            <span>₹{(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div>
                  <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#1a2e1a' }}>Payment Summary</div>
                    </div>
                    <div style={{ padding: '0 0 8px' }}>
                      {selected.invoices.length === 0 ? (
                        <div className="empty-state" style={{ padding: '32px 20px' }}>No payment records</div>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: '#f9fafb' }}>
                              {['Invoice', 'Invoice Date', 'Amount', 'Status', 'Paid On', 'Action'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: '#6b7280' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selected.invoices.map(inv => {
                              const { grand } = calcInvoice(inv);
                              return (
                                <tr key={inv.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1a2e1a' }}>{inv.id}</td>
                                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>{inv.date}</td>
                                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#15803d' }}>₹{grand.toFixed(2)}</td>
                                  <td style={{ padding: '14px 16px' }}><Badge status={inv.status} /></td>
                                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>{inv.paidDate ?? '—'}</td>
                                  <td style={{ padding: '14px 16px' }}>
                                    {inv.status !== 'Paid' ? (
                                      <button className="action-btn"
                                        style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }}
                                        onClick={() => markPaid(selected.id, inv.id)}>Mark Paid</button>
                                    ) : (
                                      <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>✓ Done</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f0fdf4' }}>
                              <td colSpan={2} style={{ padding: '14px 16px', fontWeight: 800, color: '#1a2e1a' }}>Total</td>
                              <td style={{ padding: '14px 16px', fontWeight: 800, color: '#15803d' }}>₹{stats.totalBilled.toFixed(2)}</td>
                              <td colSpan={3} style={{ padding: '14px 16px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                                Paid: ₹{stats.totalPaid.toFixed(2)} &nbsp;|&nbsp; Due: ₹{stats.totalDue.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showAddModal && (
        <CustomerModal
          customer={editCustomer}
          onClose={() => { setShowAddModal(false); setEditCustomer(null); }}
          onSave={saveCustomer}
        />
      )}

      {/* ── Invoice View Modal ── */}
      {viewInvoice && (
        <InvoiceModal
          invoice={viewInvoice.inv}
          customerName={customers.find(c => c.id === viewInvoice.cid)?.name ?? ''}
          onClose={() => setViewInvoice(null)}
          onMarkPaid={(invId) => markPaid(viewInvoice.cid, invId)}
        />
      )}
    </MainLayout>
  );
}