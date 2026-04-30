import { useEffect, useState } from 'react';
import { getUsers, giveBonus, deleteUser, updateBalance } from '../api';
import { createInvestment, getProfits } from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [profits, setProfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bonusUserId, setBonusUserId] = useState(null);
  const [bonusAmount, setBonusAmount] = useState('2500');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [investForm, setInvestForm] = useState({ carId: '', amount: '', days: '' });
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceForm, setBalanceForm] = useState({ amount: '', action: 'set' });

  useEffect(() => {
    fetchUsers();
    fetchProfits();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchProfits = async () => {
    try {
      const res = await getProfits();
      setProfits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGiveBonus = async (userId) => {
    try {
      const res = await giveBonus(userId, Number(bonusAmount));
      alert(res.data.message);
      setBonusUserId(null);
      fetchUsers();
    } catch (err) {
      alert('Failed');
    }
  };

  const handleAdminInvest = async () => {
    if (!selectedUser || !investForm.carId || !investForm.amount || !investForm.days) return;
    try {
      await createInvestment({ carId: investForm.carId, amount: Number(investForm.amount), days: Number(investForm.days), userId: selectedUser._id });
      alert('Investment created for user');
      setShowInvestModal(false);
      setSelectedUser(null);
      setInvestForm({ carId: '', amount: '', days: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert('Failed');
    }
  };

  const handleChangeBalance = async () => {
    if (!selectedUser || balanceForm.amount === '' || balanceForm.amount === undefined) return;
    try {
      const res = await updateBalance(selectedUser._id, Number(balanceForm.amount), balanceForm.action);
      alert(res.data.message);
      setShowBalanceModal(false);
      setSelectedUser(null);
      setBalanceForm({ amount: '', action: 'set' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="flex justify-center h-64"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-2">💡 Admin Actions</h3>
        <div className="flex gap-3">
          <span className="text-sm text-amber-700">You can: Give bonuses, Create investments for users, Set custom profit per investment</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Username</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Balance</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">{u.phone || '-'}</td>
                <td className="px-4 py-3 font-bold text-purple-600">{u.balance?.toLocaleString() || 0}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <div className="flex gap-2 flex-wrap">
                      {bonusUserId === u._id ? (
                        <>
                          <input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} className="w-20 px-2 py-1 border rounded text-sm" />
                          <button onClick={() => handleGiveBonus(u._id)} className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">Give</button>
                          <button onClick={() => setBonusUserId(null)} className="px-2 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setSelectedUser(u); setBalanceForm({ amount: u.balance || 0, action: 'set' }); setShowBalanceModal(true); }} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm hover:bg-emerald-200">💰 Balance</button>
                          <button onClick={() => { setBonusUserId(u._id); setBonusAmount('2500'); }} className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-sm hover:bg-violet-200">🎁 Bonus</button>
                          <button onClick={() => { setSelectedUser(u); setShowInvestModal(true); }} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">📈 Invest</button>
                          <button onClick={() => handleDelete(u._id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Delete</button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvestModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Investment for {selectedUser.username}</h2>
              <button onClick={() => { setShowInvestModal(false); setSelectedUser(null); }} className="text-gray-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Select Car</label>
                <select value={investForm.carId} onChange={(e) => setInvestForm({...investForm, carId: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required>
                  <option value="">Choose a car</option>
                  {profits.map(p => <option key={p._id} value={p._id}>{p.name} ({p.minInvestment.toLocaleString()} - {p.maxInvestment.toLocaleString()})</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Amount</label><input type="number" value={investForm.amount} onChange={(e) => setInvestForm({...investForm, amount: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Duration (Days)</label><input type="number" value={investForm.days} onChange={(e) => setInvestForm({...investForm, days: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required /></div>
              <button onClick={handleAdminInvest} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold">Create Investment (Auto Active)</button>
            </div>
          </div>
        </div>
      )}

      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Change Balance - {selectedUser.username}</h2>
              <button onClick={() => { setShowBalanceModal(false); setSelectedUser(null); }} className="text-gray-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-sm text-gray-500">Current Balance</span>
                <p className="text-2xl font-bold text-purple-600">{selectedUser.balance?.toLocaleString() || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Action</label>
                <div className="flex gap-2">
                  <button onClick={() => setBalanceForm({...balanceForm, action: 'set'})} className={`flex-1 py-2 rounded-xl text-sm font-medium ${balanceForm.action === 'set' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Set</button>
                  <button onClick={() => setBalanceForm({...balanceForm, action: 'add'})} className={`flex-1 py-2 rounded-xl text-sm font-medium ${balanceForm.action === 'add' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Add</button>
                  <button onClick={() => setBalanceForm({...balanceForm, action: 'subtract'})} className={`flex-1 py-2 rounded-xl text-sm font-medium ${balanceForm.action === 'subtract' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Subtract</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                <input type="number" value={balanceForm.amount} onChange={(e) => setBalanceForm({...balanceForm, amount: e.target.value})} className="w-full px-4 py-2 border rounded-xl" min="0" />
              </div>
              <button onClick={handleChangeBalance} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold">Update Balance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
