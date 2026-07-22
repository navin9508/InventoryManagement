import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .orders-page {
    font-family: 'DM Sans', sans-serif;
    background: #f4f6f3;
    min-height: 100vh;
    padding: 2rem;
    color: #1a1f18;
  }

  .orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .orders-title {
    font-family: 'Outfit', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
    color: #1a1f18;
  }

  .orders-subtitle {
    font-size: 0.9rem;
    color: #6b7280;
    margin-top: 0.3rem;
  }

  .btn-primary-custom {
    background: #16a34a;
    border: none;
    color: white;
    padding: 0.9rem 1.4rem;
    border-radius: 14px;
    font-weight: 700;
    font-size: 0.9rem;
    transition: 0.2s ease;
    box-shadow: 0 8px 20px rgba(22,163,74,0.2);
  }

  .btn-primary-custom:hover {
    background: #15803d;
    transform: translateY(-2px);
  }

  .form-card,
  .table-card {
    background: white;
    border-radius: 24px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .card-header-custom {
    padding: 1.3rem 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    background: #ffffff;
  }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: #1a1f18;
  }

  .card-sub {
    margin-top: 0.2rem;
    font-size: 0.82rem;
    color: #6b7280;
  }

  .card-body-custom {
    padding: 1.5rem;
  }

  .form-label {
    font-size: 0.82rem;
    font-weight: 700;
    color: #374151;
    margin-bottom: 0.45rem;
  }

  .form-control-custom {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 14px;
    padding: 0.9rem 1rem;
    font-size: 0.9rem;
    transition: 0.2s ease;
    background: #f9fafb;
  }

  .form-control-custom:focus {
    outline: none;
    border-color: #16a34a;
    background: white;
    box-shadow: 0 0 0 4px rgba(22,163,74,0.1);
  }

  .save-btn {
    background: #16a34a;
    border: none;
    color: white;
    padding: 0.85rem 1.5rem;
    border-radius: 14px;
    font-weight: 700;
    font-size: 0.9rem;
    transition: 0.2s ease;
  }

  .save-btn:hover {
    background: #15803d;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
  }

  .orders-table thead {
    background: #f9fafb;
  }

  .orders-table th {
    padding: 1rem;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    font-weight: 700;
    border-bottom: 1px solid #e5e7eb;
  }

  .orders-table td {
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.9rem;
    color: #374151;
    vertical-align: middle;
  }

  .orders-table tbody tr:hover {
    background: #f9fafb;
  }

  .order-id {
    font-weight: 700;
    color: #111827;
  }

  .product-name {
    font-weight: 700;
    color: #111827;
  }

  .supplier-name {
    font-weight: 600;
    color: #16a34a;
  }

  .price {
    font-weight: 700;
    color: #111827;
  }

  .badge-custom {
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    display: inline-block;
  }

  .badge-success {
    background: #dcfce7;
    color: #166534;
  }

  .badge-warning {
    background: #fef3c7;
    color: #92400e;
  }

  @media (max-width: 768px) {
    .orders-page {
      padding: 1rem;
    }

    .orders-title {
      font-size: 1.5rem;
    }
  }
`;

function Orders() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      supplier: 'Sri Pipes',
      product: 'PVC Pipe',
      quantity: 50,
      purchasePrice: 500,
      gst: 18,
      invoice: 'INV-5001',
      status: 'Received'
    },
    {
      id: 2,
      supplier: 'Aqua Flow',
      product: 'Water Tap',
      quantity: 30,
      purchasePrice: 250,
      gst: 12,
      invoice: 'INV-5002',
      status: 'Pending'
    }
  ]);

  const [formData, setFormData] = useState({
    supplier: '',
    product: '',
    quantity: '',
    purchasePrice: '',
    gst: '',
    invoice: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddOrder = (e) => {
    e.preventDefault();

    const newOrder = {
      id: orders.length + 1,
      supplier: formData.supplier,
      product: formData.product,
      quantity: formData.quantity,
      purchasePrice: formData.purchasePrice,
      gst: formData.gst,
      invoice: formData.invoice,
      status: 'Pending'
    };

    setOrders([...orders, newOrder]);

    setFormData({
      supplier: '',
      product: '',
      quantity: '',
      purchasePrice: '',
      gst: '',
      invoice: ''
    });
  };

  return (
    <MainLayout>
      <style>{styles}</style>

      <div className="orders-page">

        {/* Header */}
        <div className="orders-header">

          <div>
            <h2 className="orders-title">
              🗒️ Purchase Orders
            </h2>

            <div className="orders-subtitle">
              Manage supplier purchase orders and invoices
            </div>
          </div>

          <button className="btn-primary-custom">
            + New Order
          </button>

        </div>

        {/* Form Card */}
        <div className="form-card">

          <div className="card-header-custom">
            <h5 className="card-title">
              Add Purchase Order
            </h5>

            <div className="card-sub">
              Enter supplier and product details
            </div>
          </div>

          <div className="card-body-custom">

            <form onSubmit={handleAddOrder}>

              <div className="row g-4">

                {/* Supplier */}
                <div className="col-md-4">
                  <label className="form-label">
                    Add Supplier
                  </label>

                  <input
                    type="text"
                    className="form-control-custom"
                    name="supplier"
                    placeholder="Enter supplier name"
                    value={formData.supplier}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Product */}
                <div className="col-md-4">
                  <label className="form-label">
                    Add Product
                  </label>

                  <input
                    type="text"
                    className="form-control-custom"
                    name="product"
                    placeholder="Enter product name"
                    value={formData.product}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="col-md-4">
                  <label className="form-label">
                    Quantity
                  </label>

                  <input
                    type="number"
                    className="form-control-custom"
                    name="quantity"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Purchase Price */}
                <div className="col-md-4">
                  <label className="form-label">
                    Purchase Price
                  </label>

                  <input
                    type="number"
                    className="form-control-custom"
                    name="purchasePrice"
                    placeholder="Enter price"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* GST */}
                <div className="col-md-4">
                  <label className="form-label">
                    GST (%)
                  </label>

                  <input
                    type="number"
                    className="form-control-custom"
                    name="gst"
                    placeholder="Enter GST"
                    value={formData.gst}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Invoice */}
                <div className="col-md-4">
                  <label className="form-label">
                    Invoice Number
                  </label>

                  <input
                    type="text"
                    className="form-control-custom"
                    name="invoice"
                    placeholder="Enter invoice number"
                    value={formData.invoice}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="save-btn"
                >
                  Save Order
                </button>
              </div>

            </form>

          </div>

        </div>

        {/* Table */}
        <div className="table-card">

          <div className="card-header-custom">
            <h5 className="card-title">
              Purchase Order List
            </h5>

            <div className="card-sub">
              View all supplier purchase orders
            </div>
          </div>

          <div className="card-body-custom">

            <div className="table-responsive">

              <table className="orders-table">

                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Supplier</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>GST</th>
                    <th>Invoice No</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {orders.map((order) => (

                    <tr key={order.id}>

                      <td className="order-id">
                        #{order.id}
                      </td>

                      <td className="supplier-name">
                        {order.supplier}
                      </td>

                      <td className="product-name">
                        {order.product}
                      </td>

                      <td>
                        {order.quantity}
                      </td>

                      <td className="price">
                        ₹ {order.purchasePrice}
                      </td>

                      <td>
                        {order.gst}%
                      </td>

                      <td>
                        {order.invoice}
                      </td>

                      <td>

                        <span
                          className={`badge-custom ${
                            order.status === 'Received'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {order.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Orders;