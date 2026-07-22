import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const styles = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 1.5rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  divider: {
    width: '1px',
    height: '24px',
    background: '#e5e7eb',
  },
  breadcrumb: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500,
  },
  breadcrumbPage: {
    fontSize: '14px',
    color: '#111827',
    fontWeight: 600,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6b7280',
    transition: 'background 0.12s',
    position: 'relative',
    flexShrink: 0,
  },
  notifDot: {
    position: 'absolute',
    top: '7px',
    right: '7px',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#ef4444',
    border: '1.5px solid #fff',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0 12px',
    height: '36px',
    width: '220px',
    transition: 'border-color 0.15s',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '13px',
    color: '#111827',
    width: '100%',
  },
  searchIcon: {
    fontSize: '14px',
    color: '#9ca3af',
    flexShrink: 0,
  },
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px 4px 4px',
    borderRadius: '999px',
    border: '1px solid #e5e7eb',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 0.12s',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1f4037, #2c7744)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  avatarName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#111827',
  },
  chevron: {
    fontSize: '10px',
    color: '#9ca3af',
  },
  dropdownWrap: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    minWidth: '200px',
    padding: '6px',
    zIndex: 200,
  },
  dropdownHeader: {
    padding: '8px 10px 10px',
    borderBottom: '1px solid #f3f4f6',
    marginBottom: '4px',
  },
  dropdownName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#111827',
  },
  dropdownRole: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '1px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '7px',
    fontSize: '13px',
    color: '#374151',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.1s',
    width: '100%',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
  },
  dropdownItemDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '7px',
    fontSize: '13px',
    color: '#dc2626',
    cursor: 'pointer',
    transition: 'background 0.1s',
    width: '100%',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    marginTop: '2px',
  },
  dropdownDivider: {
    height: '1px',
    background: '#f3f4f6',
    margin: '4px 0',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoCircle: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #1f4037, #2c7744)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '17px',
    flexShrink: 0,
  },
  brandText: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#111827',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '10px',
    color: '#9ca3af',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#22c55e',
    display: 'inline-block',
    marginRight: '5px',
  },
};

const PAGE_LABELS = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/orders': 'Orders',
  '/suppliers': 'Suppliers',
  '/sales': 'Sales & Billing',
  '/salesreport': 'Reports',
  '/customers': 'Customers',
};

function Navbar() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const currentPage = PAGE_LABELS[location.pathname] || 'Dashboard';

  const toggleDropdown = () => setDropdownOpen((v) => !v);
  const closeDropdown = () => setDropdownOpen(false);

  return (
    <nav style={styles.nav}>

      {/* Left: Brand + breadcrumb */}
      <div style={styles.left}>
        <div style={styles.brandRow}>
          <div style={styles.logoCircle}>🔧</div>
          <div>
            <div style={styles.brandText}>Rakshion Agro</div>
            <div style={styles.brandSub}>Solution</div>
          </div>
        </div>

        <div style={styles.divider} />

        <span style={styles.breadcrumb}>
          Menu&nbsp;&nbsp;/&nbsp;&nbsp;
          <span style={styles.breadcrumbPage}>{currentPage}</span>
        </span>
      </div>

      {/* Right: Search + actions + avatar */}
      <div style={styles.right}>

        {/* Search */}
        <div
          style={{
            ...styles.searchBar,
            borderColor: searchFocused ? '#2c7744' : '#e5e7eb',
          }}
        >
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search..."
            style={styles.searchInput}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search"
          />
        </div>

        {/* Notification bell */}
        <button
          style={styles.iconBtn}
          aria-label="Notifications"
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          🔔
          <span style={styles.notifDot} />
        </button>

        {/* Settings */}
        <button
          style={styles.iconBtn}
          aria-label="Settings"
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          ⚙️
        </button>

        {/* Avatar + Dropdown */}
        <div style={styles.dropdownWrap}>
          <button
            style={styles.avatarBtn}
            onClick={toggleDropdown}
            aria-label="User menu"
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={styles.avatar}>A</div>
            <span style={styles.avatarName}>Admin</span>
            <span style={styles.chevron}>▼</span>
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 150 }}
                onClick={closeDropdown}
              />

              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropdownName}>Admin User</div>
                  <div style={styles.dropdownRole}>
                    <span style={styles.statusDot} />
                    Store Manager · Online
                  </div>
                </div>

                <Link
                  to="/profile"
                  style={styles.dropdownItem}
                  onClick={closeDropdown}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  👤 My Profile
                </Link>

                <Link
                  to="/settings"
                  style={styles.dropdownItem}
                  onClick={closeDropdown}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  ⚙️ Settings
                </Link>

                <div style={styles.dropdownDivider} />

                <button
                  style={styles.dropdownItemDanger}
                  onClick={closeDropdown}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  🚪 Sign Out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;