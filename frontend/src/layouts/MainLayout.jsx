import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function MainLayout({ children }) {
  return (
    <div>
      <Navbar />

      <div className="d-flex">
        <Sidebar />

        <div className="container-fluid p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;