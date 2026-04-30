import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user-dashboard');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );
}
