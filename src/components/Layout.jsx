import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import WhatsAppButton from './WhatsAppButton';
import { getMe } from '../api';

export default function Layout() {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    } else {
      getMe().then(res => {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      });
    }
  }, [token, location.pathname]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 mt-16">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
      <WhatsAppButton />
    </div>
  );
}
