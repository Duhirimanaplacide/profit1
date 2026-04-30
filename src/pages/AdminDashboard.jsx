import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfits, getInvestments, getWithdrawals, getUsers, getBonuses } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];

const AdminDashboard = () => {
  const [profits, setProfits] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profitsRes, investmentsRes, withdrawalsRes, usersRes, bonusesRes] = await Promise.all([
          getProfits(), getInvestments(), getWithdrawals(), getUsers(), getBonuses()
        ]);
        setProfits(profitsRes.data);
        setInvestments(investmentsRes.data);
        setWithdrawals(withdrawalsRes.data);
        setUsers(usersRes.data);
        setBonuses(bonusesRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + (inv.customProfit || (inv.expectedReturn - inv.amount)), 0);
  const pendingInvestments = investments.filter(i => i.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const pendingBonuses = bonuses.filter(b => b.status === 'pending').length;
  const totalBonusesPaid = bonuses.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.amount, 0);
  const activeUsers = users.filter(u => u.role === 'user').length;

  const investmentStatusData = [
    { name: 'Active', value: investments.filter(i => i.status === 'active').length },
    { name: 'Completed', value: investments.filter(i => i.status === 'completed').length },
    { name: 'Pending', value: investments.filter(i => i.status === 'pending').length },
    { name: 'Cancelled', value: investments.filter(i => i.status === 'cancelled').length },
  ];

  const carData = profits.map(p => ({ name: p.name, investments: investments.filter(i => i.car?._id === p._id).length }));

  const recentInvestments = investments.slice(0, 5).map(inv => ({
    name: new Date(inv.createdAt).toLocaleDateString(),
    amount: inv.amount
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold">Welcome Admin! 👑</h1>
          <p className="mt-2 text-white/80 text-lg">Manage investments, set profits, approve bonuses.</p>
          <div className="flex items-center gap-4 mt-6">
            <Link to="/cars" className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
              + Add Car
            </Link>
            <Link to="/users" className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300">
              Manage Users
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 hover:scale-105 hover:shadow-xl transition-all duration-300">
          <p className="text-sm font-medium text-gray-500">Total Invested</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 hover:scale-105 hover:shadow-xl transition-all duration-300">
          <p className="text-sm font-medium text-gray-500">Total Profit Set</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 hover:scale-105 hover:shadow-xl transition-all duration-300">
          <p className="text-sm font-medium text-gray-500">Active Users</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{activeUsers}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 hover:scale-105 hover:shadow-xl transition-all duration-300">
          <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{pendingInvestments + pendingWithdrawals + pendingBonuses}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 hover:scale-105 hover:shadow-xl transition-all">
          <p className="text-sm font-medium text-gray-500">Pending Withdrawals</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{pendingWithdrawals}</p>
          <p className="text-xs text-gray-500 mt-1">{withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0).toLocaleString()} total</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 hover:scale-105 hover:shadow-xl transition-all">
          <p className="text-sm font-medium text-gray-500">Pending Bonuses</p>
          <p className="text-3xl font-bold text-pink-600 mt-2">{pendingBonuses}</p>
          <p className="text-xs text-gray-500 mt-1">Total paid: {totalBonusesPaid.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 hover:scale-105 hover:shadow-xl transition-all">
          <p className="text-sm font-medium text-gray-500">Available Cars</p>
          <p className="text-3xl font-bold text-cyan-600 mt-2">{profits.length}</p>
          <p className="text-xs text-gray-500 mt-1">For investment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Investments by Car</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={carData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="investments" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Investment Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={recentInvestments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Investment Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={investmentStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                {investmentStatusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {investmentStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Pending Approvals</h2>
          </div>
          <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
            {investments.filter(i => i.status === 'pending').map(inv => (
              <div key={inv._id} className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{inv.user?.username} invested {inv.amount.toLocaleString()}</span>
                  <Link to="/investments" className="text-sm text-violet-600 hover:underline">Review →</Link>
                </div>
              </div>
            ))}
            {withdrawals.filter(w => w.status === 'pending').map(w => (
              <div key={w._id} className="p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{w.user?.username} withdrawal {w.amount.toLocaleString()}</span>
                  <Link to="/withdrawals" className="text-sm text-violet-600 hover:underline">Review →</Link>
                </div>
              </div>
            ))}
            {bonuses.filter(b => b.status === 'pending').map(b => (
              <div key={b._id} className="p-3 rounded-xl bg-pink-50 border border-pink-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{b.user?.username} bonus request {b.amount.toLocaleString()}</span>
                  <Link to="/users" className="text-sm text-violet-600 hover:underline">Review →</Link>
                </div>
              </div>
            ))}
            {investments.filter(i => i.status === 'pending').length === 0 && withdrawals.filter(w => w.status === 'pending').length === 0 && bonuses.filter(b => b.status === 'pending').length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">✅ All caught up! No pending approvals.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
