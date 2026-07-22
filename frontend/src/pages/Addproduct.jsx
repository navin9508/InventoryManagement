import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

/* ── Config ─────────────────────────────────────────────────────────────────── */
const CATEGORIES = ['Pipes', 'Nozzles', 'Valves', 'Fittings', 'Tools', 'Other'];
const GST_RATES  = [0, 5, 12, 18, 28];
const UNITS      = ['pcs', 'rolls', 'kg', 'litre', 'box', 'set', 'mtr', 'ft'];
const STATES     = [
  'Andhra Pradesh','Assam','Bihar','Delhi','Gujarat','Haryana',
  'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab',
  'Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal',
];

const CAT_ICONS = {
  Pipes: '🪣', Nozzles: '💧', Valves: '🔧',
  Fittings: '🔩', Tools: '🛠️', Other: '📦',
};

const EMPTY = {
  name: '', sku: '', hsn: '', brand: '', supplier: '', description: '',
  gstin: '', buyerGstin: '', invoice: '', state: 'Tamil Nadu', taxType: 'cgst_sgst',
  category: 'Pipes',
  mrp: '', cost: '', price: '', discount: '',
  gst: 18,
  stock: '', minStock: '', maxStock: '',
  unit: 'pcs',
};

/* ── GSTIN Validator ─────────────────────────────────────────────────────────── */
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const validateGSTIN = (v) => !v ? null : GSTIN_REGEX.test(v.toUpperCase());

/* ── Field ───────────────────────────────────────────────────────────────────── */
function Field({ label, error, hint, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        letterSpacing: .6, textTransform: 'uppercase',
        color: error ? '#b91c1c' : '#6b7280', marginBottom: 6,
      }}>
        {label}
        {required && <span style={{ color: '#e24b4a', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 4, fontWeight: 600 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

/* ── Shared input style ──────────────────────────────────────────────────────── */
const inputStyle = (hasError = false) => ({
  width: '100%', padding: '9px 12px', fontSize: 13,
  border: `1px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  borderRadius: 10, outline: 'none',
  background: hasError ? '#fff1f2' : '#f9fafb',
  color: '#1a2e1a', boxSizing: 'border-box',
  fontFamily: 'inherit', transition: 'border-color .15s, box-shadow .15s',
});

const focusStyle = { borderColor: '#16a34a', boxShadow: '0 0 0 3px rgba(22,163,74,.12)' };

function Input({ value, onChange, type = 'text', placeholder, hasError, mono, prefix, ...rest }) {
  const [focused, setFocused] = useState(false);
  const style = {
    ...inputStyle(hasError),
    ...(focused ? focusStyle : {}),
    ...(mono ? { fontFamily: 'monospace', letterSpacing: .5 } : {}),
    ...(prefix ? { paddingLeft: 24 } : {}),
  };
  return (
    <div style={prefix ? { position: 'relative' } : undefined}>
      {prefix && (
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9ca3af', pointerEvents: 'none' }}>
          {prefix}
        </span>
      )}
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={style}
        {...rest}
      />
    </div>
  );
}

function Select({ value, onChange, children, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value} onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(hasError), cursor: 'pointer', ...(focused ? focusStyle : {}) }}
    >
      {children}
    </select>
  );
}

/* ── Card wrapper ────────────────────────────────────────────────────────────── */
function SectionCard({ icon, title, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
      padding: '20px 24px', marginBottom: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 30, height: 30, background: '#f0fdf4', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        }}>{icon}</div>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#1a2e1a' }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

/* ── Grid helpers ────────────────────────────────────────────────────────────── */
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' };
const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' };
const span2 = { gridColumn: '1 / -1' };

/* ── GSTIN Status Badge ──────────────────────────────────────────────────────── */
function GSTINBadge({ value }) {
  const result = validateGSTIN(value);
  if (result === null) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, marginTop: 4,
      background: result ? '#f0fdf4' : '#fff1f2',
      color: result ? '#15803d' : '#b91c1c',
    }}>
      {result ? '✓ Valid GSTIN format' : '✗ Invalid format'}
    </div>
  );
}

/* ── Price Breakdown ─────────────────────────────────────────────────────────── */
function PriceBreakdown({ price, cost, discount, gst, taxType }) {
  if (!price || price <= 0) return null;
  const discAmt   = price * discount / 100;
  const afterDisc = price - discAmt;
  const gstAmt    = afterDisc * gst / 100;
  const halfGst   = gstAmt / 2;
  const total     = afterDisc + gstAmt;
  const margin    = cost > 0 ? ((total - cost) / cost * 100) : null;

  const row = (label, val, color) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', padding: '3px 0' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: color || '#1a2e1a' }}>{val}</span>
    </div>
  );

  return (
    <div style={{ background: '#f8faf8', borderRadius: 10, padding: '12px 14px', marginTop: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8 }}>
        Price Breakdown
      </div>
      {row('Base selling price', `₹${price.toFixed(2)}`)}
      {discount > 0 && row(`Discount (${discount}%)`, `-₹${discAmt.toFixed(2)}`, '#e24b4a')}
      {discount > 0 && row('After discount', `₹${afterDisc.toFixed(2)}`)}
      {taxType === 'cgst_sgst'
        ? <>
            {row(`CGST (${gst / 2}%)`, `₹${halfGst.toFixed(2)}`)}
            {row(`SGST (${gst / 2}%)`, `₹${halfGst.toFixed(2)}`)}
          </>
        : row(`IGST (${gst}%)`, `₹${gstAmt.toFixed(2)}`)
      }
      <div style={{
        borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontWeight: 800, color: '#1a2e1a' }}>Total (incl. GST)</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#15803d' }}>₹{total.toFixed(2)}</span>
      </div>
      {margin !== null && (
        <div style={{
          borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 8,
          display: 'flex', justifyContent: 'space-between', fontSize: 12,
        }}>
          <span style={{ color: '#6b7280' }}>Gross margin</span>
          <span style={{ fontWeight: 700, color: margin >= 0 ? '#15803d' : '#e24b4a' }}>
            {margin.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Preview Card ────────────────────────────────────────────────────────────── */
function PreviewCard({ form }) {
  const price     = parseFloat(form.price)    || 0;
  const cost      = parseFloat(form.cost)     || 0;
  const discount  = parseFloat(form.discount) || 0;
  const mrp       = parseFloat(form.mrp)      || 0;
  const qty       = parseFloat(form.stock) || 0;
  const minStock  = parseFloat(form.minStock) || 0;
  const discAmt   = price * discount / 100;
  const afterDisc = price - discAmt;
  const gstAmt    = afterDisc * form.gst / 100;
  const total     = afterDisc + gstAmt;

  const previewRow = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: '#1a2e1a' }}>{value || '—'}</span>
    </div>
  );

  const PreviewSection = ({ title, children }) => (
    <div style={{ background: '#f8faf8', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
      overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.06)',
      position: 'sticky', top: 24,
    }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#15803d,#166534)', padding: '18px 18px 14px' }}>
        <div style={{ fontSize: 10, color: '#86efac', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>LIVE PREVIEW</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
          }}>
            {CAT_ICONS[form.category] || '📦'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 700, fontSize: 15, color: form.name ? '#fff' : '#86efac',
              fontStyle: form.name ? 'normal' : 'italic',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {form.name || 'Product name…'}
            </div>
            {form.sku && (
              <div style={{ fontSize: 11, color: '#86efac', marginTop: 2, fontFamily: 'monospace' }}>
                {form.sku}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Badges */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            {form.category}
          </span>
          {form.hsn && (
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              HSN: {form.hsn}
            </span>
          )}
        </div>

        {/* Pricing */}
        <PreviewSection title="Pricing">
          {previewRow('Cost price', cost > 0 ? `₹${cost.toFixed(2)}` : null)}
          {previewRow('Selling (excl. GST)', price > 0 ? `₹${price.toFixed(2)}` : null)}
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              <span>Discount</span>
              <span style={{ fontWeight: 600, color: '#e24b4a' }}>-₹{discAmt.toFixed(2)}</span>
            </div>
          )}
          {previewRow(`GST (${form.gst}%)`, price > 0 ? `₹${gstAmt.toFixed(2)}` : null)}
          {mrp > 0 && previewRow('MRP', `₹${mrp.toFixed(2)}`)}
          <div style={{
            borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#1a2e1a' }}>Total incl. GST</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#15803d' }}>
              {price > 0 ? `₹${total.toFixed(2)}` : '—'}
            </span>
          </div>
        </PreviewSection>

        {/* GST Details */}
        {form.gstin && (
          <PreviewSection title="GST Details">
            <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace', letterSpacing: .5, marginBottom: 4, wordBreak: 'break-all' }}>
              {form.gstin.toUpperCase()}
            </div>
            {previewRow('Tax type', form.taxType === 'cgst_sgst' ? 'CGST + SGST' : 'IGST')}
            {form.state && previewRow('Place of supply', form.state)}
            {form.buyerGstin && (
              <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace', letterSpacing: .5, marginTop: 4 }}>
                Buyer: {form.buyerGstin.toUpperCase()}
              </div>
            )}
          </PreviewSection>
        )}

        {/* Stock */}
        <PreviewSection title="Stock">
          {previewRow('Initial qty', qty > 0 ? `${qty} ${form.unit}` : null)}
          {previewRow('Min alert', minStock > 0 ? `${minStock} ${form.unit}` : null)}
        </PreviewSection>

        {/* Supplier */}
        {form.supplier && (
          <PreviewSection title="Supplier">
            <div style={{ fontSize: 12, color: '#6b7280' }}>{form.supplier}</div>
          </PreviewSection>
        )}

        {!form.name && !form.price && (
          <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: 13, padding: '8px 0' }}>
            Fill the form to see preview
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────────── */
export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved]     = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const touch = k => setTouched(t => ({ ...t, [k]: true }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name     = 'Product name is required';
    if (!form.sku.trim())               e.sku      = 'SKU is required';
    if (!(parseFloat(form.price) > 0)) e.price    = 'Enter a valid selling price';
    if (form.stock === '')           e.stock = 'Enter initial stock';
    return e;
  };

  const handleSubmit = async () => {

  const e = validate();

  setTouched({
    name: true,
    sku: true,
    price: true,
    stock: true
  });

  if (Object.keys(e).length > 0) {
    setErrors(e);
    return;
  }

  try {

    const response = await fetch(
      "http://localhost:8080/api/products",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(form)
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save product");
    }

    const savedProduct = await response.json();

    console.log(savedProduct);

    setSaved(true);

    setTimeout(() => {
      navigate("/inventory");
    }, 1500);

  } catch (error) {

    console.error(error);
    console.log(form);

    alert("Error saving product");
  }
};

  const handleReset = () => {
    if (window.confirm('Reset all fields?')) {
      setForm(EMPTY); setErrors({}); setTouched({});
    }
  };

  /* Progress */
  const required = ['name', 'sku', 'price', 'stock'];
  const done = required.filter(k => form[k] !== '' && form[k] !== 0).length;
  const progress = Math.round((done / required.length) * 100);

  /* Shared input props builder */
  const inp = (key, type = 'text', extra = {}) => ({
    type,
    value: form[key],
    onChange: e => set(key, type === 'number'
      ? (e.target.value === '' ? '' : Number(e.target.value))
      : e.target.value),
    onBlur: () => touch(key),
    hasError: !!(touched[key] && errors[key]),
    ...extra,
  });

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .add-prod * { font-family: 'DM Sans', sans-serif; }
        .cat-option { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 6px; cursor: pointer; text-align: center; transition: all .15s; background: #fff; }
        .cat-option:hover { border-color: #86efac; background: #f0fdf4; }
        .cat-option.selected { border-color: #16a34a; background: #f0fdf4; border-width: 1.5px; }
        .gst-pill { padding: 7px 14px; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; background: #fff; color: #6b7280; transition: all .15s; font-family: inherit; }
        .gst-pill:hover { border-color: #86efac; }
        .gst-pill.active { background: #15803d; color: #fff; border-color: #15803d; }
        .unit-pill { padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; background: #fff; color: #6b7280; transition: all .15s; font-family: inherit; }
        .unit-pill:hover { border-color: #16a34a; }
        .unit-pill.active { background: #f0fdf4; border-color: #16a34a; color: #15803d; }
        .save-btn { padding: 11px 26px; background: #15803d; border: none; border-radius: 10px; color: #fff; font-weight: 800; font-size: 13px; cursor: pointer; transition: all .2s; font-family: inherit; }
        .save-btn:hover { background: #166534; transform: translateY(-1px); }
        .save-btn:disabled { background: #d1d5db; cursor: not-allowed; transform: none; }
        .reset-btn { padding: 11px 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; color: #6b7280; font-weight: 700; font-size: 13px; cursor: pointer; transition: all .15s; font-family: inherit; }
        .reset-btn:hover { border-color: #b91c1c; color: #b91c1c; }
        .toast { position: fixed; bottom: 24px; right: 24px; background: #15803d; color: #fff; padding: 12px 18px; border-radius: 12px; font-weight: 800; font-size: 13px; box-shadow: 0 8px 24px rgba(22,163,74,.35); display: flex; align-items: center; gap: 8px; z-index: 9999; animation: slideUp .25s ease; }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="add-prod" style={{ padding: '24px 28px', background: '#f8faf8', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 24, color: '#1a2e1a', letterSpacing: -.5 }}>➕ Add Product</h1>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Fill in product details, pricing and GST information</p>
          </div>
          <div style={{ textAlign: 'right', minWidth: 180 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>FORM COMPLETION</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#15803d', borderRadius: 99, transition: 'width .3s ease' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 13, color: progress === 100 ? '#15803d' : '#374151' }}>{progress}%</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: Form ── */}
          <div>

            {/* 1. Basic Info */}
            <SectionCard icon="📝" title="Basic Information">
              <div style={grid2}>
                <div style={span2}>
                  <Field label="Product Name" error={touched.name && errors.name} required>
                    <Input {...inp('name')} placeholder="e.g. PVC Pipe 2 inch" />
                  </Field>
                </div>
                <Field label="SKU / Item Code" error={touched.sku && errors.sku} required>
                  <Input {...inp('sku')} placeholder="e.g. PVC-001" mono />
                </Field>
                <Field label="HSN / SAC Code" hint="Harmonised System Nomenclature code for GST filing">
                  <Input {...inp('hsn')} placeholder="e.g. 3917" mono />
                </Field>
                <Field label="Brand">
                  <Input {...inp('brand')} placeholder="Brand name" />
                </Field>
                <Field label="Supplier / Vendor">
                  <Input {...inp('supplier')} placeholder="Supplier name" />
                </Field>
                <div style={span2}>
                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Brief product description (optional)"
                      rows={2}
                      style={{ ...inputStyle(), resize: 'vertical' }}
                      onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* 2. GST & Business */}
            <SectionCard icon="🏦" title="GST & Business Details">
              <div style={grid2}>
                <div style={span2}>
                  <Field label="Your GSTIN (Supplier)" hint="15-character GST Identification Number">
                    <Input
                      value={form.gstin}
                      onChange={e => set('gstin', e.target.value.toUpperCase())}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      mono
                      maxLength={15}
                    />
                    <GSTINBadge value={form.gstin} />
                  </Field>
                </div>
                <Field label="Buyer GSTIN">
                  <Input
                    value={form.buyerGstin}
                    onChange={e => set('buyerGstin', e.target.value.toUpperCase())}
                    placeholder="Buyer's GSTIN"
                    mono
                    maxLength={15}
                  />
                  <GSTINBadge value={form.buyerGstin} />
                </Field>
                <Field label="Invoice Number">
                  <Input {...inp('invoice')} placeholder="e.g. INV-2024-001" mono />
                </Field>
                <Field label="Place of Supply (State)">
                  <Select value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">— Select state —</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Tax Type">
                  <Select value={form.taxType} onChange={e => set('taxType', e.target.value)}>
                    <option value="igst">IGST (inter-state)</option>
                    <option value="cgst_sgst">CGST + SGST (intra-state)</option>
                  </Select>
                </Field>
              </div>
            </SectionCard>

            {/* 3. Category */}
            <SectionCard icon="🏷️" title="Category">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {CATEGORIES.map(c => (
                  <div
                    key={c}
                    className={`cat-option ${form.category === c ? 'selected' : ''}`}
                    onClick={() => set('category', c)}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{CAT_ICONS[c]}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: form.category === c ? '#15803d' : '#374151' }}>{c}</div>
                    {form.category === c && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', margin: '5px auto 0' }} />
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* 4. Pricing */}
            <SectionCard icon="💰" title="Pricing & Tax">
              <div style={grid2}>
                <Field label="MRP (Max. Retail Price) ₹">
                  <Input {...inp('mrp', 'number')} placeholder="0.00" prefix="₹" min={0} />
                </Field>
                <Field label="Cost / Purchase Price ₹">
                  <Input {...inp('cost', 'number')} placeholder="0.00" prefix="₹" min={0} />
                </Field>
                <Field label="Selling Price (excl. GST) ₹" error={touched.price && errors.price} required>
                  <Input {...inp('price', 'number')} placeholder="0.00" prefix="₹" min={0} />
                </Field>
                <Field label="Discount (%)">
                  <Input {...inp('discount', 'number')} placeholder="0" min={0} max={100} />
                </Field>
                <div style={span2}>
                  <Field label="GST Rate">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {GST_RATES.map(r => (
                        <button
                          key={r}
                          className={`gst-pill ${form.gst === r ? 'active' : ''}`}
                          onClick={() => set('gst', r)}
                          type="button"
                        >
                          {r}%
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
              <PriceBreakdown
                price={parseFloat(form.price) || 0}
                cost={parseFloat(form.cost) || 0}
                discount={parseFloat(form.discount) || 0}
                gst={form.gst}
                taxType={form.taxType}
              />
            </SectionCard>

            {/* 5. Stock */}
            <SectionCard icon="📊" title="Stock Settings">
              <div style={grid3}>
                <Field label="Initial Qty" error={touched.stock && errors.stock} required>
                  <Input {...inp('stock', 'number')} placeholder="0" min={0} />
                </Field>
                <Field label="Min Stock Alert">
                  <Input {...inp('minStock', 'number')} placeholder="0" min={0} />
                </Field>
                <Field label="Max Stock">
                  <Input {...inp('maxStock', 'number')} placeholder="0" min={0} />
                </Field>
              </div>
              <Field label="Unit">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {UNITS.map(u => (
                    <button
                      key={u}
                      className={`unit-pill ${form.unit === u ? 'active' : ''}`}
                      onClick={() => set('unit', u)}
                      type="button"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </Field>
              {parseFloat(form.minStock) > 0 && (
                <div style={{
                  background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10,
                  padding: '10px 12px', fontSize: 12, color: '#92400e', fontWeight: 600, marginTop: 8,
                }}>
                  ⚠️ Low-stock alert triggers below <strong>{form.minStock} {form.unit}</strong>
                </div>
              )}
            </SectionCard>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingBottom: 32 }}>
              <button className="reset-btn" onClick={handleReset}>↺ Reset</button>
              <button className="save-btn" onClick={handleSubmit} disabled={saved}>
                {saved ? '✓ Saved! Redirecting…' : '✓ Save Product'}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Preview ── */}
          <PreviewCard form={form} />
        </div>
      </div>

      {saved && (
        <div className="toast">
          <span style={{ fontSize: 18 }}>✅</span>
          Product saved successfully!
        </div>
      )}
    </MainLayout>
  );
}