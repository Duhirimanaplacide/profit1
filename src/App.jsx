import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Cars from './pages/Cars';
import Investments from './pages/Investments';
import Withdrawals from './pages/Withdrawals';
import Users from './pages/Users';
import Messages from './pages/Messages';
import AdminMessages from './pages/AdminMessages';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="user-dashboard" element={<UserDashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cars" element={<Cars />} />
          <Route path="cars/new" element={<Cars />} />
          <Route path="investments" element={<Investments />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="users" element={<Users />} />
          <Route path="messages" element={<Messages />} />
          <Route path="admin-messages" element={<AdminMessages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}