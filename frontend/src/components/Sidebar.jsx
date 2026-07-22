import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/inventory', icon: '📦', label: 'Inventory' },
  { to: '/orders', icon: '🧾', label: 'Orders' },
  { to: '/suppliers', icon: '🚚', label: 'Suppliers' },
  { to: '/sales', icon: '💰', label: 'Sales & Billing' },
  { to: '/salesreport', icon: '📈', label: 'Reports' },
  { to: '/customers', icon: '👥', label: 'Customers' },
];

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#18181b',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    borderRight: '1px solid #27272a',
    flexShrink: 0,
  },
  brandWrap: {
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid #27272a',
    marginBottom: '0.5rem',
  },
  brandBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#f59e0b',
    background: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: '4px',
    padding: '2px 8px',
    marginBottom: '8px',
  },
  brandTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.01em',
    margin: 0,
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '11px',
    color: '#71717a',
    marginTop: '3px',
  },
  nav: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    listStyle: 'none',
    margin: 0,
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#52525b',
    padding: '0.75rem 0.5rem 0.4rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#a1a1aa',
    fontSize: '13.5px',
    fontWeight: 500,
    transition: 'background 0.12s, color 0.12s',
    marginBottom: '2px',
    cursor: 'pointer',
  },
  navLinkActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#fff',
    fontSize: '13.5px',
    fontWeight: 600,
    background: '#27272a',
    marginBottom: '2px',
    cursor: 'pointer',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '18px',
    background: '#f59e0b',
    borderRadius: '0 3px 3px 0',
  },
  iconWrap: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  iconWrapActive: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    borderRadius: '6px',
    background: 'rgba(245,158,11,0.15)',
    flexShrink: 0,
  },
  footer: {
    padding: '0.75rem 1rem 1.25rem',
    borderTop: '1px solid #27272a',
  },
  footerUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.12s',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e4e4e7',
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: '11px',
    color: '#71717a',
  },
};

function NavLink({ item, isActive }) {
  const linkStyle = isActive ? styles.navLinkActive : styles.navLink;
  const iconStyle = isActive ? styles.iconWrapActive : styles.iconWrap;

  return (
    <li>
      <Link
        to={item.to}
        style={linkStyle}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = '#27272a';
            e.currentTarget.style.color = '#e4e4e7';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#a1a1aa';
          }
        }}
      >
        {isActive && <span style={styles.activeDot} />}
        <span style={iconStyle}>{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

function Sidebar() {
  const location = useLocation();

  const overviewItems = navItems.slice(0, 3);
  const managementItems = navItems.slice(3, 6);
  const analyticsItems = navItems.slice(6, 8);

  return (
    <div style={styles.sidebar}>

      {/* Brand */}
      <div style={styles.brandWrap}>
        <div style={styles.brandBadge}>Hardware</div>
        <h4 style={styles.brandTitle}>StoreOS</h4>
        <div style={styles.brandSub}>Inventory Management</div>
      </div>

      {/* Navigation */}
      <ul style={styles.nav}>

        <li style={styles.sectionLabel}>Overview</li>
        {overviewItems.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            isActive={location.pathname === item.to}
          />
        ))}

        <li style={styles.sectionLabel}>Management</li>
        {managementItems.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            isActive={location.pathname === item.to}
          />
        ))}

        <li style={styles.sectionLabel}>Analytics</li>
        {analyticsItems.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            isActive={location.pathname === item.to}
          />
        ))}

      </ul>

      {/* Footer / User */}
      <div style={styles.footer}>
        <div
          style={styles.footerUser}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#27272a')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={styles.avatar}>A</div>
          <div>
            <div style={styles.userName}>Admin</div>
            <div style={styles.userRole}>Store Manager</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Sidebar;