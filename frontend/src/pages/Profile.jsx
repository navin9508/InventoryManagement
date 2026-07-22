import React, { useState } from 'react';

function Profile() {
  const [showMenu, setShowMenu] = useState(false);

  const user = {
    name: 'Navin Kumar',
    role: 'Store Manager',
    email: 'navin@retailmart.com',
    phone: '+91 9876543210',
    branch: 'Madurai Main Branch',
    employeeId: 'RM1024',
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          background: #f4f7f5;
        }

        .profile-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 60px;
        }

        .profile-card {
          width: 320px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          position: relative;
        }

        .profile-header {
          background: linear-gradient(135deg, #16a34a, #166534);
          height: 110px;
          position: relative;
        }

        .profile-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: white;
          position: absolute;
          bottom: -45px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2.5rem;
          border: 4px solid white;
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .profile-content {
          padding: 60px 24px 24px;
          text-align: center;
        }

        .profile-name {
          font-size: 1.4rem;
          font-weight: bold;
          color: #111827;
        }

        .profile-role {
          color: #16a34a;
          margin-top: 6px;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .profile-details {
          margin-top: 24px;
          text-align: left;
        }

        .detail-item {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 12px;
          background: #f7faf8;
        }

        .detail-label {
          font-size: 0.72rem;
          color: #6b7280;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .detail-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #111827;
        }

        .menu-container {
          margin-top: 22px;
          position: relative;
        }

        .menu-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .menu-btn:hover {
          transform: translateY(-1px);
        }

        .dropdown-menu {
          margin-top: 10px;
          background: white;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }

        .dropdown-item {
          padding: 14px 16px;
          cursor: pointer;
          transition: 0.2s ease;
          font-size: 0.95rem;
          color: #111827;
        }

        .dropdown-item:hover {
          background: #f3f4f6;
        }
      `}</style>

      <div className="profile-wrapper">
        <div className="profile-card">

          <div className="profile-header">
            <div className="profile-avatar">🛒</div>
          </div>

          <div className="profile-content">

            <div className="profile-name">
              {user.name}
            </div>

            <div className="profile-role">
              {user.role}
            </div>

            <div className="profile-details">

              <div className="detail-item">
                <div className="detail-label">Employee ID</div>
                <div className="detail-value">{user.employeeId}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{user.email}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Phone</div>
                <div className="detail-value">{user.phone}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Branch</div>
                <div className="detail-value">{user.branch}</div>
              </div>

            </div>

            <div className="menu-container">

              <button
                className="menu-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                Account Options ▼
              </button>

              {showMenu && (
                <div className="dropdown-menu">

                  <div className="dropdown-item">
                    👤 Edit Profile
                  </div>

                  <div className="dropdown-item">
                    🔒 Change Password
                  </div>

                  <div className="dropdown-item">
                    🧾 View Reports
                  </div>

                  <div className="dropdown-item">
                    🚪 Logout
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;