import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { OutletProvider } from './OutletContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ServicesPage from './pages/ServicesPage'; // 👈 1. Import ServicesPage
import InquiryPage from './pages/InquiryPage';
import AboutUsPage from './pages/AboutUsPage';
import AdminDashboard from './pages/AdminDashboard';


function AdminDashboardWrapper() {
  const navigate = useNavigate();
  return <AdminDashboard onSwitchToStorefront={() => navigate('/')} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <OutletProvider>
        <BrowserRouter>
          <div className="w-full min-h-screen bg-neutral-50 m-0 p-0 flex flex-col">
            <Navbar />
            <main className="w-full flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/services" element={<ServicesPage />} /> {/* 👈 2. Add Route */}
                <Route path="/inquiry" element={<InquiryPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/admin" element={<AdminDashboardWrapper />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </OutletProvider>
    </LanguageProvider>
  );
}