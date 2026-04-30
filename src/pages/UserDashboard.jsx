import { useEffect, useState } from 'react';
import { getProfits, getInvestments, createInvestment, requestBonus } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
const INVESTMENT_AMOUNTS = [5000, 10000, 20000, 25000, 30000, 35000, 50000];

const UserDashboard = () => {
  const [profits, setProfits] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [amount, setAmount] = useState(5000);
  const [days, setDays] = useState(3);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profitsRes, investmentsRes] = await Promise.all([getProfits(), getInvestments()]);
        setProfits(profitsRes.data);
        setInvestments(investmentsRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleInvest = async () => {
    if (!selectedCar) return;
    try {
      const res = await createInvestment({ carId: selectedCar._id, amount, days });
      alert(res.data.message);
      setShowInvestModal(false);
      const investmentsRes = await getInvestments();
      setInvestments(investmentsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Investment failed');
    }
  };

  const handleBonusRequest = async () => {
    if (!bonusAmount || !bonusReason) return;
    try {
      const res = await requestBonus({ amount: Number(bonusAmount), reason: bonusReason });
      alert(res.data.message);
      setShowBonusModal(false);
      setBonusAmount('');
      setBonusReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpected = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + ((inv.customProfit || inv.expectedReturn) - inv.amount), 0);
  const activeInvestments = investments.filter(i => i.status === 'active').length;
  const completedInvestments = investments.filter(i => i.status === 'completed').length;
  const approvedBonuses = investments.filter(i => i.bonusStatus === 'approved').reduce((sum, inv) => sum + inv.bonusAmount, 0);

  const expectedReturn = amount * (1 + (selectedCar?.profitPercent || 40) / 100);

  const statusData = [
    { name: 'Active', value: activeInvestments },
    { name: 'Completed', value: completedInvestments },
    { name: 'Pending', value: investments.filter(i => i.status === 'pending').length },
  ];

  const investmentHistory = investments.map(inv => ({
    date: new Date(inv.createdAt).toLocaleDateString(),
    amount: inv.amount,
    return: inv.expectedReturn
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold">Welcome, {user.username}! 🚀</h1>
          <p className="mt-2 text-white/80 text-lg">Balance: {user.balance?.toLocaleString() || 0}</p>
          <div className="flex gap-4 mt-4">
            <button onClick={() => setShowBonusModal(true)} className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition">🎁 Request Bonus</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Invested</p>
          <p className="text-xl font-bold text-gray-800">{totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Expected Return</p>
          <p className="text-xl font-bold text-green-600">{totalExpected.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Total Profit</p>
          <p className="text-xl font-bold text-purple-600">{totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-amber-600">{activeInvestments}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-xl font-bold text-indigo-600">{completedInvestments}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Bonuses Earned</p>
          <p className="text-xl font-bold text-pink-600">{approvedBonuses.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200">
        <h3 className="font-bold text-amber-800 mb-2">🔥 Why Invest With Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3"><span className="text-2xl">💰</span><div><p className="font-medium">40% Profit Return</p><p className="text-xs text-gray-500">Highest returns in the market</p></div></div>
          <div className="flex items-center gap-3"><span className="text-2xl">⚡</span><div><p className="font-medium">Fast Processing</p><p className="text-xs text-gray-500">Get paid within days</p></div></div>
          <div className="flex items-center gap-3"><span className="text-2xl">🎁</span><div><p className="font-medium">2,500 Bonus</p><p className="text-xs text-gray-500">After admin approval</p></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Investment Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Investment History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={investmentHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Available Cars for Investment</h2>
          <p className="text-sm text-gray-500">Choose a car and start earning 40% profit. Payment: Code 12614848 under Placide</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {profits.map(profit => (
              <div key={profit._id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center overflow-hidden">
                  {profit.image ? (
                    <img src={profit.image.startsWith('http') ? profit.image : `http://localhost:5000${profit.image}`} alt={profit.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">🚗</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{profit.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{profit.description || 'Premium investment option'}</p>
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Min:</span><span className="font-medium">{profit.minInvestment.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Max:</span><span className="font-medium">{profit.maxInvestment.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Profit:</span><span className="font-bold text-green-600">{profit.profitPercent}%</span></div>
                    <div className="flex justify-between"><span>Duration:</span><span className="font-medium">{profit.durationDays} days</span></div>
                  </div>
                  <button
                    onClick={() => { setSelectedCar(profit); setAmount(profit.minInvestment); setDays(profit.durationDays); setShowInvestModal(true); }}
                    className="w-full mt-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Invest Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showInvestModal && selectedCar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center overflow-hidden">
              {selectedCar.image ? (
                <img src={selectedCar.image.startsWith('http') ? selectedCar.image : `http://localhost:5000${selectedCar.image}`} alt={selectedCar.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🚗</span>
              )}
            </div>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Invest in {selectedCar.name}</h2>
              <button onClick={() => setShowInvestModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Investment Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {INVESTMENT_AMOUNTS.filter(a => a >= selectedCar.minInvestment && a <= selectedCar.maxInvestment).map(a => (
                    <button key={a} onClick={() => setAmount(a)} className={`py-2 rounded-lg text-sm font-medium transition ${amount === a ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {a.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Duration (Days)</label>
                <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} min={1} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Investment:</span><span className="font-bold">{amount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Profit ({selectedCar.profitPercent}%):</span><span className="font-bold text-green-600">{(amount * selectedCar.profitPercent / 100).toLocaleString()}</span></div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2"><span>Expected Return:</span><span className="text-purple-600">{expectedReturn.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm text-gray-500"><span>Bonus:</span><span className="text-green-600">+2,500 (after approval)</span></div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                <strong>Payment:</strong> Use code <strong>12614848</strong> under name <strong>Placide</strong>
              </div>

              <button onClick={handleInvest} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg">
                Confirm Investment
              </button>
            </div>
          </div>
        </div>
      )}

      {showBonusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">🎁 Request Bonus</h2>
              <button onClick={() => setShowBonusModal(false)} className="text-gray-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Bonus Amount</label><input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} className="w-full px-4 py-2 border rounded-xl" required /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Reason</label><textarea value={bonusReason} onChange={(e) => setBonusReason(e.target.value)} className="w-full px-4 py-2 border rounded-xl" rows={3} placeholder="Why do you deserve a bonus?" required /></div>
              <p className="text-xs text-gray-500">Bonus requests require admin approval.</p>
              <button onClick={handleBonusRequest} className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
