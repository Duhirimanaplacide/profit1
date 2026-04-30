import { useState, useEffect } from 'react';
import { updateProfile } from '../api';

export default function Profile() {
  const [user, setUser] = useState({});
  const [form, setForm] = useState({ username: '', phone: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setForm({ username: userData.username || '', phone: userData.phone || '' });
    if (userData.profilePicture) {
      setPreview(userData.profilePicture.startsWith('http') ? userData.profilePicture : `http://localhost:5000${userData.profilePicture}`);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile(user._id, form, profilePicture);
      localStorage.setItem('user', JSON.stringify(updated.data));
      setUser(updated.data);
      setProfilePicture(null);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500">Update your profile information and picture</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 ring-4 ring-violet-100">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <label className="cursor-pointer px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition">
            Change Photo
            <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <input type="text" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Enter phone number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Balance</label>
            <div className="px-4 py-2 bg-gray-50 rounded-xl text-gray-500">{user.balance?.toLocaleString() || 0}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <div className="px-4 py-2 bg-gray-50 rounded-xl text-gray-500 capitalize">{user.role}</div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
