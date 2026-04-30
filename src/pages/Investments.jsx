import { useEffect, useState } from 'react';
import { getInvestments, updateInvestmentStatus, updateInvestmentProfit, updateInvestmentBonus } from '../api';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [customProfit, setCustomProfit] = useState('');
  const [bonusId, setBonusId] = useState(null);
  const [bonusAmount, setBonusAmount] = useState('2500');
  const [statusNote, setStatusNote] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const res = await getInvestments();
      setInvestments(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    try {
      await updateInvestmentStatus(id, { status, adminNote: statusNote });
      fetchInvestments();
      setStatusNote('');
    } catch (err) {
      alert('Failed');
    }
  };

  const handleProfit = async (id) => {
    if (!customProfit) return;
    try {
      await updateInvestmentProfit(id, { customProfit: Number(customProfit) });
      setEditingId(null);
      setCustomProfit('');
      fetchInvestments();
    } catch (err) {
      alert('Failed');
    }
  };

  const handleBonus = async (id, bonusStatus) => {
    try {
      await updateInvestmentBonus(id, { bonusStatus, bonusAmount: Number(bonusAmount) });
      setBonusId(null);
      setBonusAmount('2500');
      fetchInvestments();
    } catch (err) {
      alert('Failed');
    }
  };

  const filtered = filter === 'all' ? investments : investments.filter(i => i.status === filter);

  if (loading) return <div className="flex justify-center h-64"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {user.role === 'admin' ? 'All Investments' : 'My Investments'}
        </h1>
        <div className="flex gap-2">
          {['all', 'active', 'completed', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${filter === f ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      {user.role === 'admin' && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-2">💡 Admin Actions</h3>
          <p className="text-sm text-amber-700">You can set custom profit for each investment and approve bonuses. Click "Set Profit" or "Approve Bonus" on any investment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No investments found</div>
        ) : (
          filtered.map(inv => (
            <div key={inv._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-violet-100 to-fuchsia-100 overflow-hidden relative">
                {inv.car?.image ? (
                  <img src={inv.car.image.startsWith('http') ? inv.car.image : `http://localhost:5000${inv.car.image}`} alt={inv.car.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">🚗</span>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    inv.status === 'active' ? 'bg-green-500 text-white' :
                    inv.status === 'completed' ? 'bg-blue-500 text-white' :
                    inv.status === 'pending' ? 'bg-yellow-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>{inv.status}</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-gray-800">{inv.car?.name || 'Car'}</h3>
                {user.role === 'admin' && <p className="text-sm text-gray-500">User: {inv.user?.username}</p>}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Amount</p><p className="font-bold">{inv.amount.toLocaleString()}</p></div>
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Days</p><p className="font-bold">{inv.days}</p></div>
                  <div className="bg-green-50 rounded-lg p-2"><p className="text-gray-500">Expected Return</p><p className="font-bold text-green-600">{inv.expectedReturn.toLocaleString()}</p></div>
                  <div className="bg-purple-50 rounded-lg p-2"><p className="text-gray-500">Bonus</p>
                    <p className={`font-bold ${inv.bonusStatus === 'approved' ? 'text-green-600' : inv.bonusStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {inv.bonusStatus === 'approved' ? `+${inv.bonusAmount.toLocaleString()}` : inv.bonusStatus}
                    </p>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <div className="space-y-2 pt-2 border-t">
                    {editingId === inv._id ? (
                      <div className="flex gap-2">
                        <input type="number" value={customProfit} onChange={(e) => setCustomProfit(e.target.value)} placeholder="Custom profit" className="flex-1 px-2 py-1 border rounded text-sm" />
                        <button onClick={() => handleProfit(inv._id)} className="px-3 py-1 bg-violet-600 text-white rounded text-sm">Set</button>
                        <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-300 rounded text-sm">×</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(inv._id); setCustomProfit(inv.customProfit || ''); }} className="w-full py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm hover:bg-violet-200">
                        💰 Set Profit
                      </button>
                    )}

                    {bonusId === inv._id ? (
                      <div className="flex gap-2">
                        <input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} className="w-20 px-2 py-1 border rounded text-sm" />
                        <button onClick={() => handleBonus(inv._id, 'approved')} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Approve</button>
                        <button onClick={() => handleBonus(inv._id, 'rejected')} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Reject</button>
                        <button onClick={() => setBonusId(null)} className="px-2 py-1 bg-gray-300 rounded text-sm">×</button>
                      </div>
                    ) : inv.bonusStatus === 'pending' ? (
                      <button onClick={() => setBonusId(inv._id)} className="w-full py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm hover:bg-pink-200">
                        🎁 Approve Bonus
                      </button>
                    ) : null}

                    {inv.status === 'pending' && (
                      <div className="flex gap-2">
                        <input type="text" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Admin note..." className="flex-1 px-2 py-1 border rounded text-sm" />
                        <button onClick={() => handleStatus(inv._id, 'active')} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Activate</button>
                        <button onClick={() => handleStatus(inv._id, 'rejected')} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Reject</button>
                      </div>
                    )}
                    {inv.status === 'active' && (
                      <button onClick={() => handleStatus(inv._id, 'completed')} className="w-full py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        ✅ Mark Completed
                      </button>
                    )}
                  </div>
                )}

                {inv.adminNote && <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">📝 {inv.adminNote}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
