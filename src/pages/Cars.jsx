import { useEffect, useState, useRef } from 'react';
import { getProfits, createProfit, updateProfit, deleteProfit } from '../api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://backend-71p0.onrender.com';

export default function Cars() {
  const [profits, setProfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [form, setForm] = useState({ name: '', price: 50000, minInvestment: 5000, maxInvestment: 50000, profitPercent: 40, durationDays: 3, description: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    fetchProfits();
  }, []);

  const fetchProfits = async () => {
    try {
      const res = await getProfits();
      setProfits(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCar) {
        await updateProfit(editingCar._id, form, image);
      } else {
        await createProfit(form, image);
      }
      setShowModal(false);
      setEditingCar(null);
      setImage(null);
      setImagePreview('');
      setForm({ name: '', price: 50000, minInvestment: 5000, maxInvestment: 50000, profitPercent: 40, durationDays: 3, description: '' });
      fetchProfits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setForm({ name: car.name, price: car.price, minInvestment: car.minInvestment, maxInvestment: car.maxInvestment, profitPercent: car.profitPercent, durationDays: car.durationDays, description: car.description || '' });
    setImagePreview(car.image ? `${API_BASE}${car.image}` : '');
    setImage(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this car?')) return;
    try {
      await deleteProfit(id);
      fetchProfits();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) return <div className="flex justify-center h-64"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Cars</h1>
        <button onClick={() => { setEditingCar(null); setForm({ name: '', price: 50000, minInvestment: 5000, maxInvestment: 50000, profitPercent: 40, durationDays: 3, description: '' }); setImage(null); setImagePreview(''); setShowModal(true); }} className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700">+ Add Car</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profits.map(car => (
          <div key={car._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="h-48 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center overflow-hidden">
              {car.image ? (
                <img src={car.image.startsWith('http') ? car.image : `${API_BASE}${car.image}`} alt={car.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🚗</span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800">{car.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{car.description || 'No description'}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Price:</span><span className="font-medium">{car.price.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Min/Max:</span><span className="font-medium">{car.minInvestment.toLocaleString()} - {car.maxInvestment.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Profit:</span><span className="font-bold text-green-600">{car.profitPercent}%</span></div>
                <div className="flex justify-between"><span>Duration:</span><span className="font-medium">{car.durationDays} days</span></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(car)} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Edit</button>
                <button onClick={() => handleDelete(car._id)} className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCar ? 'Edit Car' : 'Add Car'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Car Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🚗</span>
                    )}
                  </div>
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Choose Image</button>
                  </div>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Car Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Price</label><input type="number" value={form.price} onChange={(e) => setForm({...form, price: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-600 mb-1">Min Investment</label><input type="number" value={form.minInvestment} onChange={(e) => setForm({...form, minInvestment: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" required /></div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">Max Investment</label><input type="number" value={form.maxInvestment} onChange={(e) => setForm({...form, maxInvestment: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-600 mb-1">Profit %</label><input type="number" value={form.profitPercent} onChange={(e) => setForm({...form, profitPercent: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" required /></div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">Duration (Days)</label><input type="number" value={form.durationDays} onChange={(e) => setForm({...form, durationDays: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" required /></div>
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold">{editingCar ? 'Update' : 'Add'} Car</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
