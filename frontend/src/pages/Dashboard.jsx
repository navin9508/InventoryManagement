import MainLayout from '../layouts/MainLayout';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  .dash-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f6f3;
    min-height: 100vh;
    padding: 2rem;
    color: #1a1f18;
  }

  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
  }

  .dash-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 2rem;
    letter-spacing: -0.03em;
    color: #1a1f18;
    margin: 0;
  }

  .dash-title span {
    color: #2d6a4f;
  }

  .dash-date {
    font-size: 0.82rem;
    color: #6b7280;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: white;
    padding: 0.6rem 1rem;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    font-family: 'Outfit', sans-serif;
  }

  /* Stat Cards */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    opacity: 0.12;
  }

  .stat-card.green::before { background: #2d6a4f; }
  .stat-card.amber::before { background: #d97706; }
  .stat-card.blue::before  { background: #1d4ed8; }
  .stat-card.rose::before  { background: #be123c; }

  .stat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .stat-card.green .stat-icon {
    background: #d1fae5;
    color: #065f46;
  }

  .stat-card.amber .stat-icon {
    background: #fef3c7;
    color: #92400e;
  }

  .stat-card.blue .stat-icon {
    background: #dbeafe;
    color: #1e40af;
  }

  .stat-card.rose .stat-icon {
    background: #ffe4e6;
    color: #9f1239;
  }

  .stat-label {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 0.35rem;
    font-family: 'Outfit', sans-serif;
  }

  .stat-value {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 2rem;
    letter-spacing: -0.04em;
    margin-bottom: 0.25rem;
    line-height: 1.1;
  }

  .stat-card.green .stat-value { color: #065f46; }
  .stat-card.amber .stat-value { color: #92400e; }
  .stat-card.blue .stat-value  { color: #1e40af; }
  .stat-card.rose .stat-value  { color: #9f1239; }

  .stat-sub {
    font-size: 0.84rem;
    color: #9ca3af;
    font-weight: 400;
    font-family: 'Outfit', sans-serif;
  }

  /* Mid Row */
  .mid-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .panel {
    background: white;
    border-radius: 20px;
    padding: 1.75rem;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .panel-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: -0.02em;
    color: #1a1f18;
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .panel-title-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2d6a4f;
    display: inline-block;
  }

  .purchase-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.92rem;
    font-family: 'Outfit', sans-serif;
  }

  .purchase-row:last-child {
    border-bottom: none;
  }

  .purchase-label {
    color: #6b7280;
    font-weight: 500;
  }

  .purchase-val {
    font-weight: 700;
    font-size: 0.95rem;
    color: #1a1f18;
  }

  .purchase-val.warn {
    color: #d97706;
  }

  .purchase-val.succ {
    color: #059669;
  }

  /* Revenue */
  .rev-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .rev-tile {
    text-align: center;
    background: #f9fafb;
    border-radius: 14px;
    padding: 1rem 0.5rem;
  }

  .rev-num {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: -0.03em;
    margin-bottom: 0.2rem;
  }

  .rev-num.g { color: #059669; }
  .rev-num.b { color: #2563eb; }
  .rev-num.r { color: #dc2626; }

  .rev-lbl {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
  }

  /* Progress */
  .prog-wrap {
    background: #f3f4f6;
    border-radius: 999px;
    height: 10px;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .prog-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #2d6a4f, #52b788);
    width: 75%;
  }

  .prog-label-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #9ca3af;
    margin-top: 0.35rem;
    font-family: 'Outfit', sans-serif;
  }

  /* Transactions */
  .tx-panel {
    background: white;
    border-radius: 20px;
    padding: 1.75rem;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .tx-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .view-all-btn {
    font-size: 0.78rem;
    font-weight: 700;
    color: #2d6a4f;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    border: 1.5px solid #2d6a4f;
    background: transparent;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: 'Outfit', sans-serif;
  }

  .view-all-btn:hover {
    background: #2d6a4f;
    color: white;
  }

  .tx-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    font-family: 'Outfit', sans-serif;
  }

  .tx-table thead tr {
    border-bottom: 2px solid #f3f4f6;
  }

  .tx-table thead th {
    text-align: left;
    padding: 0.7rem 0.75rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9ca3af;
    white-space: nowrap;
  }

  .tx-table tbody tr {
    border-bottom: 1px solid #f9fafb;
    transition: background 0.1s ease;
  }

  .tx-table tbody tr:last-child {
    border-bottom: none;
  }

  .tx-table tbody tr:hover {
    background: #f9fafb;
  }

  .tx-table td {
    padding: 0.9rem 0.75rem;
    color: #374151;
    vertical-align: middle;
  }

  .tx-id {
    font-size: 0.8rem;
    color: #9ca3af;
    font-weight: 600;
  }

  .tx-customer {
    font-weight: 600;
    color: #1a1f18;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .tx-avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
    color: white;
  }

  .avatar-sale {
    background: #2d6a4f;
  }

  .avatar-purchase {
    background: #d97706;
  }

  .tx-badge {
    display: inline-block;
    padding: 0.25rem 0.7rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-family: 'Outfit', sans-serif;
  }

  .badge-sale {
    background: #d1fae5;
    color: #065f46;
  }

  .badge-purchase {
    background: #fef3c7;
    color: #92400e;
  }

  .tx-amount {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    color: #1a1f18;
  }

  .tx-date {
    font-size: 0.82rem;
    color: #9ca3af;
    font-family: 'Outfit', sans-serif;
  }

  @media (max-width: 900px) {
    .stat-grid {
      grid-template-columns: 1fr 1fr;
    }

    .mid-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 540px) {
    .stat-grid {
      grid-template-columns: 1fr;
    }

    .dash-root {
      padding: 1rem;
    }
  }
`;

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function Dashboard() {
  const recentTransactions = [
    {
      id: 1,
      customer: 'Arun Traders',
      type: 'Sale',
      amount: '₹12,500',
      date: '21 May 2026'
    },
    {
      id: 2,
      customer: 'Sri Pipes',
      type: 'Purchase',
      amount: '₹8,200',
      date: '21 May 2026'
    },
    {
      id: 3,
      customer: 'Kumar Hardware',
      type: 'Sale',
      amount: '₹5,400',
      date: '20 May 2026'
    }
  ];

  const stats = [
    {
      variant: 'green',
      icon: '📦',
      label: 'Total Products',
      value: '520',
      sub: 'Available inventory items'
    },
    {
      variant: 'amber',
      icon: '⚠️',
      label: 'Low Stock Items',
      value: '14',
      sub: 'Need immediate restock'
    },
    {
      variant: 'blue',
      icon: '💳',
      label: "Today's Sales",
      value: '₹24,500',
      sub: '18 orders completed'
    },
    {
      variant: 'rose',
      icon: '📈',
      label: 'Monthly Revenue',
      value: '₹2.8L',
      sub: 'This month overall'
    }
  ];

  return (
    <MainLayout>
      <style>{styles}</style>

      <div className="dash-root">

        {/* Header */}
        <div className="dash-header">
          <h2 className="dash-title">
            Good Morning, <span>Admin</span> 👋
          </h2>

          <span className="dash-date">
            Thu, 21 May 2026
          </span>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          {stats.map((s) => (
            <div key={s.label} className={`stat-card ${s.variant}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Mid Grid */}
        <div className="mid-grid">

          {/* Purchase Summary */}
          <div className="panel">
            <h4 className="panel-title">
              <span className="panel-title-dot"></span>
              Purchase Summary
            </h4>

            {[
              {
                label: 'Total Purchases',
                val: '₹1,45,000',
                cls: ''
              },
              {
                label: 'Pending Orders',
                val: '12',
                cls: 'warn'
              },
              {
                label: 'Completed Orders',
                val: '86',
                cls: 'succ'
              },
              {
                label: 'Suppliers',
                val: '18',
                cls: ''
              }
            ].map((row) => (
              <div className="purchase-row" key={row.label}>
                <span className="purchase-label">{row.label}</span>

                <span className={`purchase-val ${row.cls}`}>
                  {row.val}
                </span>
              </div>
            ))}
          </div>

          {/* Revenue Overview */}
          <div className="panel">
            <h4 className="panel-title">
              <span className="panel-title-dot"></span>
              Revenue Overview
            </h4>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '0.4rem'
                }}
              >
                <span
                  style={{
                    color: '#6b7280',
                    fontWeight: 500
                  }}
                >
                  Sales Progress
                </span>

                <span
                  style={{
                    fontWeight: 700,
                    color: '#2d6a4f'
                  }}
                >
                  75%
                </span>
              </div>

              <div className="prog-wrap">
                <div className="prog-fill"></div>
              </div>

              <div className="prog-label-row">
                <span>₹0</span>
                <span>Target ₹3.5L</span>
              </div>
            </div>

            <div className="rev-row">

              <div className="rev-tile">
                <div className="rev-num g">₹85K</div>
                <div className="rev-lbl">Weekly</div>
              </div>

              <div className="rev-tile">
                <div className="rev-num b">₹2.8L</div>
                <div className="rev-lbl">Monthly</div>
              </div>

              <div className="rev-tile">
                <div className="rev-num r">₹32L</div>
                <div className="rev-lbl">Yearly</div>
              </div>

            </div>
          </div>

        </div>

        {/* Transactions */}
        <div className="tx-panel">

          <div className="tx-header">

            <h4 className="panel-title" style={{ margin: 0 }}>
              <span className="panel-title-dot"></span>
              Recent Transactions
            </h4>

            <button className="view-all-btn">
              View All
            </button>

          </div>

          <div style={{ overflowX: 'auto' }}>

            <table className="tx-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer / Supplier</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {recentTransactions.map((item) => (
                  <tr key={item.id}>

                    <td className="tx-id">
                      #{item.id}
                    </td>

                    <td>
                      <div className="tx-customer">

                        <div
                          className={`tx-avatar ${
                            item.type === 'Sale'
                              ? 'avatar-sale'
                              : 'avatar-purchase'
                          }`}
                        >
                          {getInitials(item.customer)}
                        </div>

                        {item.customer}

                      </div>
                    </td>

                    <td>
                      <span
                        className={`tx-badge ${
                          item.type === 'Sale'
                            ? 'badge-sale'
                            : 'badge-purchase'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td className="tx-amount">
                      {item.amount}
                    </td>

                    <td className="tx-date">
                      {item.date}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </MainLayout>
  );
}

export default Dashboard;