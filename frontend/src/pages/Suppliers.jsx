import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * {
    box-sizing: border-box;
  }

  .supplier-root {
    font-family: 'DM Sans', sans-serif;
    background: #f5f7f4;
    min-height: 100vh;
    padding: 2rem;
    color: #1a1f18;
  }

  .supplier-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
  }

  .supplier-title-wrap h2 {
    font-family: 'Outfit', sans-serif;
    font-size: 2.3rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.05em;
    color: #111827;
  }

  .supplier-title-wrap p {
    margin-top: 0.45rem;
    color: #6b7280;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .supplier-btn {
    border: none;
    background: linear-gradient(135deg, #15803d, #166534);
    color: white;
    padding: 0.95rem 1.5rem;
    border-radius: 16px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 10px 25px rgba(21, 128, 61, 0.18);
  }

  .supplier-btn:hover {
    transform: translateY(-2px);
  }

  .supplier-card {
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(10px);
    border-radius: 28px;
    border: 1px solid #e5e7eb;
    padding: 1.7rem;
    margin-bottom: 1.8rem;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  }

  .supplier-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #111827;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.6rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #374151;
    letter-spacing: 0.02em;
  }

  .form-control {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 16px;
    padding: 0.95rem 1rem;
    font-size: 0.92rem;
    font-family: 'DM Sans', sans-serif;
    background: #f9fafb;
    transition: all 0.2s ease;
    color: #111827;
  }

  textarea.form-control {
    resize: none;
  }

  .form-control:focus {
    outline: none;
    border-color: #15803d;
    background: white;
    box-shadow: 0 0 0 5px rgba(21, 128, 61, 0.08);
  }

  .submit-wrap {
    margin-top: 1.6rem;
  }

  .submit-btn {
    border: none;
    background: linear-gradient(135deg, #15803d, #166534);
    color: white;
    padding: 0.95rem 1.6rem;
    border-radius: 16px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: 0.25s ease;
    box-shadow: 0 10px 25px rgba(21, 128, 61, 0.18);
  }

  .submit-btn:hover {
    transform: translateY(-2px);
  }

  .table-wrap {
    overflow-x: auto;
  }

  .supplier-table {
    width: 100%;
    border-collapse: collapse;
  }

  .supplier-table thead th {
    text-align: left;
    padding: 1rem;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
    font-weight: 800;
  }

  .supplier-table tbody td {
    padding: 1.1rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.93rem;
    color: #374151;
  }

  .supplier-table tbody tr {
    transition: 0.2s ease;
  }

  .supplier-table tbody tr:hover {
    background: #f9fafb;
  }

  .supplier-id {
    font-weight: 700;
    color: #15803d;
  }

  .supplier-name {
    font-weight: 700;
    color: #111827;
  }

  .supplier-contact {
    font-weight: 600;
    color: #1f2937;
  }

  .gst-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: #ecfdf5;
    color: #166534;
    font-size: 0.76rem;
    font-weight: 700;
  }

  .address-box {
    max-width: 240px;
    line-height: 1.5;
    color: #4b5563;
  }

  @media (max-width: 992px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .supplier-root {
      padding: 1rem;
    }

    .supplier-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .supplier-title-wrap h2 {
      font-size: 1.8rem;
    }
  }
`;

function Suppliers() {

  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: 'ABC Suppliers',
      contact: '9876543210',
      gst: '33ABCDE1234F1Z5',
      address: 'Chennai, Tamil Nadu'
    },
    {
      id: 2,
      name: 'Sri Pipes',
      contact: '9123456780',
      gst: '33PQRSX5678L1Z2',
      address: 'Coimbatore, Tamil Nadu'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    gst: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();

    const newSupplier = {
      id: suppliers.length + 1,
      name: formData.name,
      contact: formData.contact,
      gst: formData.gst,
      address: formData.address
    };

    setSuppliers([...suppliers, newSupplier]);

    setFormData({
      name: '',
      contact: '',
      gst: '',
      address: ''
    });
  };

  return (
    <MainLayout>

      <style>{styles}</style>

      <div className="supplier-root">

        {/* Header */}
        <div className="supplier-header">

          <div className="supplier-title-wrap">

            <h2>🚚 Suppliers Management</h2>

            <p>
              Manage supplier details, GST information and contacts
            </p>

          </div>

        </div>

        {/* Add Supplier Form */}
        <div className="supplier-card">

          <div className="supplier-card-title">
            Add New Supplier
          </div>

          <form onSubmit={handleAddSupplier}>

            <div className="form-grid">

              {/* Supplier Name */}
              <div className="form-group">

                <label>
                  Supplier Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="Enter supplier name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Contact */}
              <div className="form-group">

                <label>
                  Contact Number
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="contact"
                  placeholder="Enter contact number"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* GST */}
              <div className="form-group">

                <label>
                  GST Number
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="gst"
                  placeholder="Enter GST number"
                  value={formData.gst}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Address */}
              <div className="form-group">

                <label>
                  Address
                </label>

                <textarea
                  className="form-control"
                  name="address"
                  rows="3"
                  placeholder="Enter supplier address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>

              </div>

            </div>

            <div className="submit-wrap">

              <button
                type="submit"
                className="submit-btn"
              >
                Save Supplier
              </button>

            </div>

          </form>

        </div>

        {/* Supplier Table */}
        <div className="supplier-card">

          <div className="supplier-card-title">
            Supplier List
          </div>

          <div className="table-wrap">

            <table className="supplier-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Supplier Name</th>
                  <th>Contact</th>
                  <th>GST Number</th>
                  <th>Address</th>
                </tr>

              </thead>

              <tbody>

                {suppliers.map((supplier) => (

                  <tr key={supplier.id}>

                    <td className="supplier-id">
                      #{supplier.id}
                    </td>

                    <td className="supplier-name">
                      {supplier.name}
                    </td>

                    <td className="supplier-contact">
                      {supplier.contact}
                    </td>

                    <td>

                      <span className="gst-badge">
                        {supplier.gst}
                      </span>

                    </td>

                    <td className="address-box">
                      {supplier.address}
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

export default Suppliers;