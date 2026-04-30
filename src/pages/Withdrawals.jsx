import { useEffect, useState } from 'react';
import { getWithdrawals, createWithdrawal, updateWithdrawalStatus, getBonuses, approveBonus, getMe } from '../api';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('withdrawals');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wRes, bRes] = await Promise.all([getWithdrawals(), getBonuses()]);
      setWithdrawals(wRes.data);
      setBonuses(bRes.data);
      const meRes = await getMe();
      localStorage.setItem('user', JSON.stringify(meRes.data.user));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRequest = async () => {
    if (!amount || amount <= 0) return;
    try {
      await createWithdrawal({ amount: Number(amount) });
      alert('Withdrawal request submitted. Pending admin approval.');
      setShowModal(false);
      setAmount('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateWithdrawalStatus(id, status);
      fetchData();
    } catch (err) {
      alert('Failed');
    }
  };

  const handleBonusStatus = async (id, status) => {
    try {
      await approveBonus(id, { status });
      fetchData();
    } catch (err) {
      alert('Failed');
    }
  };

  const filtered = filter === 'all' ? (activeTab === 'withdrawals' ? withdrawals : bonuses) : (activeTab === 'withdrawals' ? withdrawals.filter(w => w.status === filter) : bonuses.filter(b => b.status === filter));

  if (loading) return <div className="flex justify-center h-64"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{user.role === 'admin' ? 'Withdrawals & Bonuses' : 'My Withdrawals'}</h1>
        <div className="flex gap-2">
          {user.role !== 'admin' && (
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700">Request Withdrawal</button>
          )}
        </div>
      </div>

      {user.role === 'admin' && (
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('withdrawals')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'withdrawals' ? 'bg-violet-600 text-white' : 'bg-gray-100'}`}>💸 Withdrawals</button>
          <button onClick={() => setActiveTab('bonuses')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'bonuses' ? 'bg-pink-600 text-white' : 'bg-gray-100'}`}>🎁 Bonus Requests</button>
        </div>
      )}

      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${filter === f ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{f}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {activeTab === 'withdrawals' ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {user.role === 'admin' && <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Requested</th>
                {user.role === 'admin' && <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No withdrawals found</td></tr>
              ) : (
                filtered.map(w => (
                  <tr key={w._id} className="hover:bg-gray-50">
                    {user.role === 'admin' && <td className="px-4 py-3 font-medium">{w.user?.username || 'User'}</td>}
                    <td className="px-4 py-3 font-bold">{w.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        w.status === 'approved' ? 'bg-green-100 text-green-700' :
                        w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(w.requestedAt).toLocaleDateString()}</td>
                    {user.role === 'admin' && (
                      <td className="px-4 py-3">
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatus(w._id, 'approved')} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Approve</button>
                            <button onClick={() => handleStatus(w._id, 'rejected')} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">Reject</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No bonus requests found</td></tr>
              ) : (
                filtered.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{b.user?.username || 'User'}</td>
                    <td className="px-4 py-3 font-bold text-pink-600">{b.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{b.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        b.status === 'approved' ? 'bg-green-100 text-green-700' :
                        b.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(b.requestedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {b.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleBonusStatus(b._id, 'approved')} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Approve</button>
                          <button onClick={() => handleBonusStatus(b._id, 'rejected')} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Request Withdrawal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Your balance: <span className="font-bold text-purple-600">{user.balance?.toLocaleString() || 0}</span></p>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Amount</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 border rounded-xl" required /></div>
              <p className="text-xs text-gray-500">Withdrawal status will remain pending until approved by admin.</p>
              <button onClick={handleRequest} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold">Request Withdrawal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
