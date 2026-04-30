import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      alert('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
        <p className="text-sm text-gray-500">Update your account password</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
            <input type="password" value={form.currentPassword} onChange={(e) => setForm({...form, currentPassword: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
            <input type="password" value={form.newPassword} onChange={(e) => setForm({...form, newPassword: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
