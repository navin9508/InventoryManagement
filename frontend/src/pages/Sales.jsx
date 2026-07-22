import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from "axios";

/* ── API Config ─────────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:8080/api/products';

/* ── Company Config ─────────────────────────────────────────────────────────── */

const COMPANY = {
  name:     'AgroHardware Pvt. Ltd.',
  address:  '12, Industrial Estate, Chennai – 600 001, Tamil Nadu',
  phone:    '+91 98765 43210',
  email:    'sales@agrohardware.in',
  gstin:    '33AABCA1234Z1Z5',
  logoPath: '/logo.png',
};

/* ── Constants ──────────────────────────────────────────────────────────────── */

const PAYMENT_METHODS = [
  { value: 'Cash',        icon: '💵' },
  { value: 'UPI',         icon: '📱' },
  { value: 'Card',        icon: '💳' },
  { value: 'Net Banking', icon: '🏦' },
];

const CAT_COLORS = {
  Pipes:    { bg: '#dbeafe', color: '#1d4ed8' },
  Nozzles:  { bg: '#fce7f3', color: '#be185d' },
  Valves:   { bg: '#d1fae5', color: '#065f46' },
  Fittings: { bg: '#fef3c7', color: '#92400e' },
};

const CATEGORY_ICONS = {
  Pipes: '🪣', Nozzles: '💧', Valves: '🔧', Fittings: '🔩',
};

/* ── Normalise Spring Boot response fields ──────────────────────────────────── */

function normalise(raw) {
  return {
    id:       raw.id,
    name:     raw.name       ?? raw.product     ?? raw.productName  ?? '—',
    sku:      raw.sku        ?? raw.skuCode      ?? raw.code         ?? `SKU-${raw.id}`,
    price:    Number(raw.price      ?? raw.unitPrice   ?? raw.basePrice   ?? 0),
    gst:      Number(raw.gst        ?? raw.gstPercent  ?? raw.taxRate     ?? 0),
    category: raw.category   ?? raw.categoryName ?? '—',
    stock:    Number(raw.stock      ?? raw.quantity    ?? 0),
    icon:     raw.icon ?? CATEGORY_ICONS[raw.category ?? raw.categoryName] ?? '📦',
  };
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function amountInWords(n) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (n === 0) return 'Zero';
  const b100  = x => x < 20 ? ones[x] : tens[Math.floor(x/10)]+(x%10?' '+ones[x%10]:'');
  const b1000 = x => x>=100 ? ones[Math.floor(x/100)]+' Hundred'+(x%100?' '+b100(x%100):'') : b100(x);
  let r='';
  if(n>=100000){r+=b1000(Math.floor(n/100000))+' Lakh ';n%=100000;}
  if(n>=1000){r+=b1000(Math.floor(n/1000))+' Thousand ';n%=1000;}
  if(n>0){r+=b1000(n);}
  return r.trim();
}

async function loadImageAsBase64(url) {
  return new Promise(resolve => {
    const img = new Image(); img.crossOrigin='anonymous';
    img.onload  = () => { const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; c.getContext('2d').drawImage(img,0,0); resolve(c.toDataURL('image/png')); };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/* ── PDF Generator ──────────────────────────────────────────────────────────── */

async function generatePDF({ cart, customerName, paymentMethod, paymentStatus, subtotal, gstAmount, grandTotal }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw  = doc.internal.pageSize.getWidth();
  const invoiceNo   = `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

  const GREEN=[21,128,61], DARK=[26,46,26], LIGHT=[240,253,244], WHITE=[255,255,255], GRAY=[120,120,120], BORDER=[187,247,208];

  doc.setFillColor(...GREEN); doc.rect(0,0,pw,40,'F');

  let logoLoaded=false;
  try { const b64=await loadImageAsBase64(COMPANY.logoPath); if(b64){doc.addImage(b64,'PNG',10,6,28,28);logoLoaded=true;} } catch(_){}

  const tx=logoLoaded?44:12;
  doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(...WHITE);
  doc.text(COMPANY.name,tx,14);
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text(COMPANY.address,tx,21);
  doc.text(`Ph: ${COMPANY.phone}   |   ${COMPANY.email}`,tx,27);
  doc.text(`GSTIN: ${COMPANY.gstin}`,tx,33);
  doc.setFont('helvetica','bold'); doc.setFontSize(14);
  doc.text('TAX INVOICE',pw-12,18,{align:'right'});
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text(`Invoice No: ${invoiceNo}`,pw-12,26,{align:'right'});
  doc.text(`Date: ${invoiceDate}`,pw-12,32,{align:'right'});

  doc.setFillColor(...LIGHT); doc.roundedRect(10,46,pw-20,18,3,3,'F');
  doc.setDrawColor(...BORDER); doc.roundedRect(10,46,pw-20,18,3,3,'S');
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...GRAY);
  doc.text('BILL TO',16,53);
  doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(...DARK);
  doc.text(customerName||'Walk-in Customer',16,60);

  doc.autoTable({
    startY:70,
    head:[['#','Product','SKU','Unit Price','Qty','GST%','Base','GST Amt','Total']],
    body: cart.map((item,i)=>{
      const base=item.price*item.quantity;
      const gst=(base*item.gst)/100;
      return [i+1, item.name, item.sku, `Rs.${item.price}`, item.quantity, `${item.gst}%`, `Rs.${base.toFixed(2)}`, `Rs.${gst.toFixed(2)}`, `Rs.${(base+gst).toFixed(2)}`];
    }),
    theme:'grid',
    styles:{fontSize:9,cellPadding:3,textColor:DARK},
    headStyles:{fillColor:GREEN,textColor:WHITE,fontStyle:'bold',halign:'center'},
    columnStyles:{0:{halign:'center',cellWidth:8},1:{cellWidth:38},2:{cellWidth:22},3:{halign:'right'},4:{halign:'center'},5:{halign:'center'},6:{halign:'right'},7:{halign:'right'},8:{halign:'right',fontStyle:'bold'}},
    alternateRowStyles:{fillColor:[250,255,250]},
    margin:{left:10,right:10},
  });

  const ay=doc.lastAutoTable.finalY+6;
  const bw=90, bx=pw-10-bw;
  doc.setFillColor(...LIGHT); doc.roundedRect(bx,ay,bw,44,3,3,'F');
  doc.setDrawColor(...BORDER); doc.roundedRect(bx,ay,bw,44,3,3,'S');
  let ry=ay+8; const c1=bx+4,c2=bx+bw-4;
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text('Subtotal:',c1,ry); doc.text(`Rs.${subtotal.toFixed(2)}`,c2,ry,{align:'right'}); ry+=7;
  doc.text('Total GST:',c1,ry); doc.text(`Rs.${gstAmount.toFixed(2)}`,c2,ry,{align:'right'}); ry+=5;
  doc.setDrawColor(...BORDER); doc.line(c1,ry,c2,ry); ry+=6;
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...GREEN);
  doc.text('Grand Total:',c1,ry); doc.text(`Rs.${grandTotal.toFixed(2)}`,c2,ry,{align:'right'}); ry+=8;
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...GRAY);
  doc.text(`Payment: ${paymentMethod}`,c1,ry);
  const stColor=paymentStatus==='Paid'?GREEN:[185,28,28];
  doc.setTextColor(...stColor); doc.setFont('helvetica','bold');
  doc.text(paymentStatus,c2,ry,{align:'right'});

  doc.setFont('helvetica','italic'); doc.setFontSize(8); doc.setTextColor(...GRAY);
  doc.text(`Amount in words: ${amountInWords(Math.round(grandTotal))} Rupees Only`,10,ay+48);

  const fy=doc.internal.pageSize.getHeight()-22;
  doc.setFillColor(...GREEN); doc.rect(0,fy,pw,0.5,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...GREEN);
  doc.text('Terms & Conditions',10,fy+7);
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
  doc.text('1. Goods once sold will not be taken back.   2. Payment due within 30 days.',10,fy+13);
  doc.text('This is a computer-generated invoice.',pw-10,fy+13,{align:'right'});

  doc.save(`${invoiceNo}.pdf`);
}

/* ── Product List Row ───────────────────────────────────────────────────────── */

function ProductListRow({ p, inCart, flashId, onAdd }) {
  const cc        = CAT_COLORS[p.category] ?? { bg:'#f1f5f9', color:'#475569' };
  const isFlashing = flashId === p.id;
  const withGST   = (p.price * (1 + p.gst / 100)).toFixed(2);

  return (
    <div onClick={() => onAdd(p)}
      style={{ display:'grid', gridTemplateColumns:'60px 220px 110px 90px 70px 110px 70px', alignItems:'center', gap:12, padding:'14px 16px', border:`1px solid ${isFlashing ? '#16a34a' : '#f0f0f0'}`, borderRadius:12, background: isFlashing ? '#dcfce7' : '#fff', cursor:'pointer', transition:'all .15s', marginBottom:8, minWidth:760 }}>
      <div style={{ fontSize:24, textAlign:'center' }}>{p.icon}</div>
      <div>
        <div style={{ fontWeight:700, fontSize:14, color:'#1a2e1a' }}>
          {p.name}
          {inCart && <span style={{ marginLeft:8, background:'#15803d', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>×{inCart.quantity}</span>}
        </div>
        <div style={{ fontSize:11, color:'#9ca3af', marginTop:4, fontFamily:'monospace' }}>{p.sku}</div>
      </div>
      <div><span style={{ background:cc.bg, color:cc.color, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20 }}>{p.category}</span></div>
      <div style={{ fontWeight:700, textAlign:'right', color:'#111827' }}>₹{p.price}</div>
      <div style={{ textAlign:'center', color:'#6b7280', fontSize:13 }}>{p.gst}%</div>
      <div style={{ fontWeight:800, color:'#15803d', textAlign:'right' }}>₹{withGST}</div>
      <div style={{ textAlign:'center', fontWeight:700, color: p.stock < 40 ? '#dc2626' : '#374151' }}>{p.stock}</div>
    </div>
  );
}

/* ── List Header ────────────────────────────────────────────────────────────── */

function ListHeader() {
  const colStyle = { fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#9ca3af', letterSpacing:0.5 };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'60px 220px 110px 90px 70px 110px 70px', alignItems:'center', gap:12, padding:'10px 16px', minWidth:760 }}>
      <div /><div style={colStyle}>Product</div><div style={colStyle}>Category</div>
      <div style={{...colStyle,textAlign:'right'}}>Base ₹</div>
      <div style={{...colStyle,textAlign:'center'}}>GST</div>
      <div style={{...colStyle,textAlign:'right'}}>Incl. GST</div>
      <div style={{...colStyle,textAlign:'center'}}>Stock</div>
    </div>
  );
}

/* ── Loading Skeleton (list rows) ──────────────────────────────────────────── */

function ListSkeleton() {
  return (
    <div>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 220px 110px 90px 70px 110px 70px', alignItems:'center', gap:12, padding:'14px 16px', border:'1px solid #f0f0f0', borderRadius:12, marginBottom:8, minWidth:760 }}>
          {[24,'70%',60,50,40,60,30].map((w, j) => (
            <div key={j} style={{ height: j===0?24:14, borderRadius:6, background:`hsl(0,0%,${94-j}%)`, width: typeof w === 'string' ? w : w }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────────── */

export default function Sales() {
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [cart,           setCart]           = useState([]);
  const [customerName,   setCustomerName]   = useState('');
  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [paymentMethod,  setPaymentMethod]  = useState('Cash');
  const [paymentStatus,  setPaymentStatus]  = useState('Paid');
  const [generating,     setGenerating]     = useState(false);
  const [flashId,        setFlashId]        = useState(null);
  const [customerAddress, setCustomerAddress] = useState('');

  /* ── Fetch products from Spring Boot ─────────────────────────────────────── */

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();
      const raw  = Array.isArray(json)
        ? json
        : (json.data ?? json.content ?? json.items ?? json.products ?? []);
      setProducts(raw.map(normalise));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  /* ── Derived ──────────────────────────────────────────────────────────────── */

  const CATEGORIES = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p =>
    (activeCategory === 'All' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  /* ── Cart helpers ─────────────────────────────────────────────────────────── */

  const addToCart = (product) => {
    setFlashId(product.id);
    setTimeout(() => setFlashId(null), 500);
    setCart(prev => {
      const hit = prev.find(i => i.id === product.id);
      return hit
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = id => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const decreaseQty = id => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
  const removeItem  = id => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart   = ()  => { if (window.confirm('Clear all items from cart?')) setCart([]); };

  /* ── Totals ───────────────────────────────────────────────────────────────── */

  const subtotal   = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmount  = cart.reduce((s, i) => s + (i.price * i.quantity * i.gst) / 100, 0);
  const grandTotal = subtotal + gstAmount;
  const itemCount  = cart.reduce((s, i) => s + i.quantity, 0);

const createInvoice = async () => {
  setGenerating(true);

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const request = {
    customerName: customerName || 'Walk-in Customer',
    billingAddress: customerAddress || '',
    status: paymentStatus === 'Paid' ? 'Paid' : 'Unpaid',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: paymentStatus === 'Paid'
      ? new Date().toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: paymentStatus === 'Paid' ? 'Paid in full' : 'Net 30',
    subtotal: subtotal,
    cgst: cgst,
    sgst: sgst,
    transport: 0,
    discount: 0,
    amount: grandTotal,
    notes: `Payment via ${paymentMethod}.`,
    items: cart.map(item => ({
      name: item.name,
      qty: item.quantity,
      unit: 'Pcs',
      unitPrice: item.price,
      amount: item.price * item.quantity,
    })),
  };

  try {
    const response = await axios.post(
      'http://localhost:8080/api/invoice/invoicecreate',
      request
    );

    const invoiceId = response.data;
    console.log('Invoice ID:', invoiceId);

    // fetch and download the generated PDF
    await downloadInvoicePdf(invoiceId);

  } catch (error) {
    console.error('Error creating invoice:', error);
    alert('Failed to generate invoice. Please try again.');
  } finally {
    setGenerating(false);
  }
};

const downloadInvoicePdf = async (invoiceId) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/invoice/pdf/${invoiceId}`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('Invoice was created, but the PDF download failed.');
  }
};

  /* ── Render ───────────────────────────────────────────────────────────────── */

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .sales-page * { font-family: 'Sora', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }
        .cart-item { background:#fff; border:1.5px solid #f0f0f0; border-radius:12px; padding:12px 14px; margin-bottom:10px; transition:border-color .15s; }
        .cart-item:hover { border-color:#86efac; }
        .qty-btn { width:30px; height:30px; border:none; border-radius:8px; font-weight:800; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; line-height:1; }
        .qty-btn.minus { background:#fee2e2; color:#b91c1c; }
        .qty-btn.plus  { background:#dcfce7; color:#15803d; }
        .qty-btn:hover { opacity:.8; transform:scale(1.1); }
        .pay-method-btn { flex:1; padding:10px 8px; border:1.5px solid #e5e7eb; border-radius:10px; background:#fff; cursor:pointer; font-weight:700; font-size:12px; color:#6b7280; transition:all .15s; text-align:center; font-family:inherit; }
        .pay-method-btn.active { background:#f0fdf4; border-color:#16a34a; color:#15803d; }
        .pay-method-btn:hover:not(.active) { border-color:#d1fae5; }
        .cat-pill { padding:6px 14px; border-radius:20px; border:1.5px solid transparent; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; white-space:nowrap; font-family:inherit; }
        .cat-pill.active { background:#15803d; color:#fff; }
        .cat-pill:not(.active) { background:#fff; color:#6b7280; border-color:#e5e7eb; }
        .cat-pill:not(.active):hover { border-color:#16a34a; color:#15803d; }
        .gen-btn { width:100%; padding:14px; border:none; border-radius:12px; font-size:15px; font-weight:800; cursor:pointer; transition:all .2s; letter-spacing:.3px; font-family:'Sora',sans-serif; }
        .gen-btn:not(:disabled) { background:linear-gradient(135deg,#16a34a,#15803d); color:#fff; box-shadow:0 4px 16px rgba(22,163,74,.3); }
        .gen-btn:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(22,163,74,.4); }
        .gen-btn:disabled { background:#d1d5db; color:#9ca3af; cursor:not-allowed; }
        .status-toggle { display:flex; border-radius:10px; overflow:hidden; border:1.5px solid #e5e7eb; }
        .status-opt { flex:1; padding:9px 0; border:none; font-weight:700; font-size:13px; cursor:pointer; transition:all .15s; font-family:'Sora',sans-serif; }
        .status-opt.paid    { background:#dcfce7; color:#15803d; }
        .status-opt.pending { background:#fef9c3; color:#a16207; }
        .status-opt.inactive{ background:#f9fafb; color:#9ca3af; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spin { animation:spin .8s linear infinite; display:inline-block; }
      `}</style>

      <div className="sales-page" style={{ display:'flex', height:'calc(100vh - 64px)', overflow:'hidden', background:'#f8faf8' }}>

        {/* ── LEFT: Product Catalog ── */}
        <div style={{ flex:'0 0 57%', display:'flex', flexDirection:'column', borderRight:'1.5px solid #e5e7eb', background:'#fff', overflow:'hidden' }}>

          {/* Header */}
          <div style={{ padding:'20px 22px 0', borderBottom:'1px solid #f0f0f0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <h2 style={{ margin:0, fontWeight:800, fontSize:20, color:'#1a2e1a' }}>🛒 Sales Billing</h2>
                <p style={{ margin:'3px 0 0', fontSize:12, color:'#9ca3af' }}>
                  {loading ? 'Loading products…' : error ? 'Failed to load' : `${filteredProducts.length} of ${products.length} products`}
                </p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {/* Refresh button */}
                <button onClick={fetchProducts} disabled={loading}
                  style={{ padding:'7px 12px', border:'1.5px solid #e5e7eb', borderRadius:10, background:'#f9fafb', cursor: loading ? 'not-allowed' : 'pointer', fontSize:14, color:'#6b7280', display:'flex', alignItems:'center', gap:6, fontWeight:700 }}>
                  <span className={loading ? 'spin' : ''}>↻</span>
                </button>
                <div style={{ background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:12, padding:'6px 12px', textAlign:'center' }}>
                  <div style={{ fontWeight:800, fontSize:18, color:'#15803d' }}>{itemCount}</div>
                  <div style={{ fontSize:10, color:'#6b7280', fontWeight:700 }}>IN CART</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div style={{ position:'relative', marginBottom:12 }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#9ca3af' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU…"
                style={{ width:'100%', padding:'9px 14px 9px 34px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:13, outline:'none', background:'#f9fafb', color:'#1a2e1a', boxSizing:'border-box', transition:'border-color .2s', fontFamily:'inherit' }}
                onFocus={e => (e.target.style.borderColor='#16a34a')} onBlur={e => (e.target.style.borderColor='#e5e7eb')} />
            </div>

            {/* Category pills */}
            <div style={{ display:'flex', gap:8, paddingBottom:14, overflowX:'auto' }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`cat-pill ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* Product area — list view only */}
          <div style={{ flex:1, overflowY:'auto', padding:'14px 16px' }}>

            {/* Error state */}
            {error && !loading && (
              <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:12, padding:'16px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:20 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight:700, color:'#b91c1c', fontSize:13 }}>Could not reach backend</div>
                  <div style={{ fontSize:12, color:'#dc2626', marginTop:2 }}>{error}</div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>
                    Make sure Spring Boot is running at <code style={{ background:'#fee2e2', padding:'1px 5px', borderRadius:4 }}>{API_BASE}</code>
                  </div>
                </div>
                <button onClick={fetchProducts} style={{ marginLeft:'auto', padding:'7px 14px', background:'#b91c1c', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>Retry</button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && <ListSkeleton />}

            {/* Empty state */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px 20px', color:'#9ca3af' }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
                <div style={{ fontWeight:700 }}>No products found</div>
                <div style={{ fontSize:12, marginTop:4 }}>Try a different search or category</div>
              </div>
            )}
            {/* List view */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div>
                <ListHeader />
                {filteredProducts.map(p => (
                  <ProductListRow key={p.id} p={p} inCart={cart.find(i => i.id === p.id)} flashId={flashId} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Invoice Panel ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', background:'#f8faf8' }}>
          <div style={{ padding:'20px 22px', flex:1 }}>

            {/* Customer */}
            <div style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:16, padding:'16px 18px', marginBottom:14 }}>
              <label style={{ display:'block', fontWeight:700, fontSize:11, color:'#374151', marginBottom:8, letterSpacing:.5 }}>👤 CUSTOMER NAME</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name or leave blank for walk-in"
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:13, outline:'none', background:'#f9fafb', color:'#1a2e1a', boxSizing:'border-box', transition:'border-color .2s', fontFamily:'inherit', marginBottom:12 }}
                onFocus={e => (e.target.style.borderColor='#16a34a')} onBlur={e => (e.target.style.borderColor='#e5e7eb')} />

              <label style={{ display:'block', fontWeight:700, fontSize:11, color:'#374151', marginBottom:8, letterSpacing:.5 }}>📍 CUSTOMER ADDRESS</label>
              <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Billing address (optional)" rows={2}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:13, outline:'none', background:'#f9fafb', color:'#1a2e1a', boxSizing:'border-box', transition:'border-color .2s', fontFamily:'inherit', resize:'vertical' }}
                onFocus={e => (e.target.style.borderColor='#16a34a')} onBlur={e => (e.target.style.borderColor='#e5e7eb')} />
            </div>

            {/* Cart */}
            <div style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:16, padding:'16px 18px', marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:11, color:'#374151', letterSpacing:.5 }}>🧾 CART ITEMS</div>
                {cart.length > 0 && (
                  <button onClick={clearCart} style={{ border:'none', background:'#fff1f2', color:'#b91c1c', padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px 20px', color:'#9ca3af' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>🛒</div>
                  <div style={{ fontWeight:600, fontSize:13 }}>Cart is empty</div>
                  <div style={{ fontSize:12, marginTop:4 }}>Click any product to add</div>
                </div>
              ) : (
                cart.map(item => {
                  const lineBase  = item.price * item.quantity;
                  const lineTotal = lineBase * (1 + item.gst / 100);
                  return (
                    <div key={item.id} className="cart-item">
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:'#1a2e1a' }}>{item.icon} {item.name}</div>
                          <div className="mono" style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>
                            ₹{item.price} × {item.quantity} + {item.gst}% GST
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontWeight:800, fontSize:15, color:'#15803d' }}>₹{lineTotal.toFixed(2)}</div>
                          <button onClick={() => removeItem(item.id)} style={{ border:'none', background:'none', color:'#d1d5db', fontSize:18, cursor:'pointer', padding:0, lineHeight:1, marginTop:2 }}>×</button>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <button className="qty-btn minus" onClick={() => decreaseQty(item.id)}>−</button>
                        <span style={{ fontWeight:800, fontSize:15, color:'#1a2e1a', minWidth:24, textAlign:'center' }}>{item.quantity}</span>
                        <button className="qty-btn plus"  onClick={() => increaseQty(item.id)}>+</button>
                        <span style={{ fontSize:11, color:'#9ca3af', marginLeft:'auto' }}>Base: ₹{lineBase.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Payment */}
            <div style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:16, padding:'16px 18px', marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:11, color:'#374151', letterSpacing:.5, marginBottom:10 }}>💳 PAYMENT METHOD</div>
              <div style={{ display:'flex', gap:8 }}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m.value} className={`pay-method-btn ${paymentMethod === m.value ? 'active' : ''}`} onClick={() => setPaymentMethod(m.value)}>
                    <div style={{ fontSize:16, marginBottom:2 }}>{m.icon}</div>
                    <div>{m.value}</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop:12 }}>
                <div style={{ fontWeight:700, fontSize:11, color:'#374151', letterSpacing:.5, marginBottom:8 }}>PAYMENT STATUS</div>
                <div className="status-toggle">
                  <button className={`status-opt ${paymentStatus === 'Paid' ? 'paid' : 'inactive'}`} onClick={() => setPaymentStatus('Paid')}>✓ Paid</button>
                  <button className={`status-opt ${paymentStatus === 'Pending' ? 'pending' : 'inactive'}`} onClick={() => setPaymentStatus('Pending')}>⏳ Pending</button>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            {cart.length > 0 && (
              <div style={{ background:'linear-gradient(135deg,#15803d,#166534)', borderRadius:16, padding:'18px 20px', marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:11, color:'#86efac', letterSpacing:.5, marginBottom:12 }}>📊 BILL SUMMARY</div>
                {[{ label:'Subtotal', val:`₹${subtotal.toFixed(2)}` },{ label:'Total GST', val:`₹${gstAmount.toFixed(2)}` }].map(r => (
                  <div key={r.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:7, fontSize:13 }}>
                    <span style={{ color:'#86efac', fontWeight:600 }}>{r.label}</span>
                    <span className="mono" style={{ color:'#fff', fontWeight:600 }}>{r.val}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid rgba(255,255,255,.2)', marginTop:10, paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'#bbf7d0', fontWeight:800, fontSize:14 }}>Grand Total</span>
                  <span className="mono" style={{ color:'#fff', fontWeight:800, fontSize:20 }}>₹{grandTotal.toFixed(2)}</span>
                </div>
                <div style={{ marginTop:8, display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#86efac' }}>via {paymentMethod}</span>
                  <span style={{ background: paymentStatus==='Paid'?'rgba(255,255,255,.2)':'rgba(250,204,21,.2)', color: paymentStatus==='Paid'?'#bbf7d0':'#fde047', padding:'2px 10px', borderRadius:20, fontWeight:700 }}>
                    {paymentStatus}
                  </span>
                </div>
              </div>
            )}

            <button className="gen-btn" disabled={generating || cart.length === 0} onClick={createInvoice}>
              {generating ? '⏳ Generating PDF…' : '📄 Generate Invoice PDF'}
            </button>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}