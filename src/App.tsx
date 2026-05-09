import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Popcorn, Coffee, Ticket, ChevronRight, X, Plus, Minus, Star, Play, CheckCircle2, Sparkles, Timer, PackageCheck, Zap, Trash2, Edit3, Save, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem, OrderResponse, ActiveOrder } from './types';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

const AdminDashboard = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [liveOrders, setLiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    category: 'Snacks',
    description: '',
    image: ''
  });

  const fetchData = async () => {
    const [menuRes, ordersRes] = await Promise.all([
      fetch('/api/menu'),
      fetch('/api/orders/live')
    ]);
    const menuData = await menuRes.json();
    const ordersData = await ordersRes.json();
    setItems(menuData);
    setLiveOrders(ordersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Poll for new orders every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeliver = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/deliver`, { method: 'PUT' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = editingId !== null;
    const url = isEditing ? `/api/menu/${editingId}` : '/api/menu';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setEditingId(null);
        setFormData({ name: '', price: 0, category: 'Snacks', description: '', image: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="pt-32 text-center uppercase tracking-widest text-white/30">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="bg-red-600 p-3 rounded-2xl">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter">ADMIN <span className="text-red-600">DASHBOARD</span></h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        {/* Live Orders Column */}
        <div className="xl:col-span-1 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Zap className="text-green-500 fill-current animate-pulse" />
            Live Orders ({liveOrders.length})
          </h2>
          <div className="space-y-4">
            {liveOrders.length === 0 ? (
              <div className="p-8 border border-white/5 bg-white/5 rounded-3xl text-center text-white/20">
                No orders waiting.
              </div>
            ) : (
              liveOrders.map(order => (
                <div key={order.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest">
                    Seat {order.seatNumber}
                  </div>
                  <div className="mb-4">
                    {order.items.map(i => (
                      <div key={Math.random()} className="text-sm font-medium">
                        <span className="text-red-500 font-bold mr-2">{i.quantity}x</span>
                        {i.name}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleDeliver(order.id)}
                    className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Delivered
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form Column */}
        <div className="xl:col-span-1">
          <form onSubmit={handleSave} className="bg-white/5 border border-white/10 p-8 rounded-[32px] sticky top-32">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              {editingId ? <Edit3 className="w-5 h-5 text-red-500" /> : <Plus className="w-5 h-5 text-red-500" />}
              {editingId ? 'Update Item' : 'Add New Item'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Item Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-colors"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-colors"
                  >
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Image URL</label>
                <input 
                  type="text" 
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-colors h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => { setEditingId(null); setFormData({name: '', price: 0, category: 'Snacks', description: '', image: ''}); }}
                    className="px-6 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-6 text-white/40">Menu Catalog ({items.length})</h2>
          {items.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-6 group hover:border-red-600/30 transition-all">
              <img src={item.image} className="w-20 h-20 rounded-xl object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-red-600/10 text-red-500 rounded-md border border-red-600/20">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-lg truncate group-hover:text-red-500 transition-colors uppercase tracking-tight">{item.name}</h3>
                </div>
                <p className="text-white/40 text-sm truncate">{item.description}</p>
                <p className="font-black mt-1 text-white">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => startEdit(item)}
                  className="p-3 bg-white/5 hover:bg-red-600/20 text-white hover:text-red-500 rounded-xl transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-3 bg-white/5 hover:bg-red-600 text-white rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActiveOrdersTracker = ({ orders }: { orders: ActiveOrder[] }) => {
  if (orders.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-96 z-40 space-y-3">
      <AnimatePresence>
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              backgroundColor: order.isDelivered ? 'rgba(34, 197, 94, 0.1)' : 'rgba(17, 17, 17, 1)'
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 overflow-hidden relative group transition-colors duration-500`}
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${order.isDelivered ? 'bg-green-500' : 'bg-red-600'} transition-colors duration-500`} />
            
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-3 rounded-xl">
                {order.status === 'Delivered' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Timer className="w-6 h-6 text-red-500 animate-pulse" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Order #{order.id.split('-').slice(-1)[0]}</span>
                  <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${order.status === 'Delivered' ? 'text-green-500' : 'text-red-500'}`}>
                    {order.status === 'Delivered' ? (
                      <>STAFF AT SEAT</>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 fill-current" />
                        PREPARING
                      </>
                    )}
                  </span>
                </div>
                <h4 className={`font-bold text-sm truncate ${order.status === 'Delivered' ? 'text-green-500' : ''}`}>
                   {order.items.map(i => i.name).join(', ')}
                </h4>
              </div>
            </div>

            <button
              onClick={() => {
                fetch(`/api/orders/${order.id}/confirm`, { method: 'PUT' });
              }}
              className={`w-full ${order.status === 'Delivered' ? 'bg-green-600 hover:bg-green-500 shadow-green-600/20' : 'bg-white/10 hover:bg-white/20'} py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-white border-none`}
            >
              <CheckCircle2 className="w-4 h-4" />
              I've Successfully Received It
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const Navbar = ({ cartCount, activeOrderCount, onCartClick }: { cartCount: number; activeOrderCount: number; onCartClick: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
    <Link to="/" className="flex items-center gap-2 group text-white decoration-transparent">
      <div className="bg-red-600 p-1.5 rounded-lg group-hover:bg-red-500 transition-colors">
        <Popcorn className="text-white w-6 h-6" />
      </div>
      <span className="text-xl font-bold tracking-tighter">CINEMA<span className="text-red-600">CRAVINGS</span></span>
    </Link>
    
    <div className="flex items-center gap-4 md:gap-8">
      <Link to="/menu" className="text-xs md:text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors decoration-transparent">Menu</Link>
      
      <div className="flex items-center gap-2">
        {activeOrderCount > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">{activeOrderCount} Active</span>
          </div>
        )}
        <button 
          onClick={onCartClick}
          className="relative p-2 text-white/70 hover:text-white transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  </nav>
);

const CartSidebar = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity,
  onCheckout,
  seatNumber,
  setSeatNumber
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[]; 
  onUpdateQuantity: (id: number, delta: number) => void;
  onCheckout: () => void;
  seatNumber: string;
  setSeatNumber: (v: string) => void;
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[70] flex flex-col p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShoppingCart className="text-red-600" />
                Your Order
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-4">
                  <Popcorn className="w-16 h-16 opacity-10" />
                  <p className="text-lg">Your cart is empty.</p>
                  <button 
                    onClick={onClose}
                    className="text-red-500 hover:text-red-400 font-medium"
                  >
                    Start ordering
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-red-600/10 border border-red-600/20 p-6 rounded-2xl mb-8">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2 block">Delivery Seat ID</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={seatNumber}
                        onChange={(e) => setSeatNumber(e.target.value.toUpperCase())}
                        placeholder="ENTER SEAT (e.g. A22)"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-600 transition-colors uppercase font-black tracking-tighter text-xl text-center"
                      />
                    </div>
                    <p className="text-[10px] text-white/30 mt-2">Required for the theater staff to find your seat.</p>
                  </div>
                  
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-white/50 mb-3">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-white/5 rounded-lg">
                            <button 
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-white/10 rounded-l-lg"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-white/10 rounded-r-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -item.quantity)}
                            className="text-xs text-white/30 hover:text-red-500 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-white/60">Total Amount</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>
              <button 
                disabled={items.length === 0 || !seatNumber}
                onClick={onCheckout}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-3"
              >
                {!seatNumber ? 'Enter Seat to Checkout' : 'Place Secret Order'}
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AISnackAdvisor = () => {
  const [movie, setMovie] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const getAdvisory = async () => {
    if (!movie.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `I am at a cinema watching the movie "${movie}". What kind of snacks (popcorn, nachos, drinks, combos) should I order? Give me a short, creative, and appetite-inducing recommendation in 2 sentences. Use cinematic language.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setSuggestion(response.text || "Something went wrong, but popcorn is always a good choice!");
    } catch (err) {
      console.error(err);
      setSuggestion("The AI is busy eating popcorn. Try the Blockbuster Combo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-600 p-2 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-xl">AI Snack Advisor</h3>
          <p className="text-sm text-white/50">Tell us what you're watching</p>
        </div>
      </div>
      
      <div className="relative mb-6">
        <input 
          type="text" 
          value={movie}
          onChange={(e) => setMovie(e.target.value)}
          placeholder="e.g., Interstellar or John Wick"
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-white/20"
        />
        <button 
          onClick={getAdvisory}
          disabled={loading || !movie}
          className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          {loading ? 'Thinking...' : 'Advise Me'}
          {!loading && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {suggestion && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-2xl"
          >
            <p className="leading-relaxed italic text-purple-200">"{suggestion}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Pages ---

const Home = () => (
  <div className="relative min-h-screen pt-24 px-6 overflow-hidden">
    {/* Atmospheric Background */}
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-red-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full" />
    </div>

    <div className="relative z-10 max-w-5xl mx-auto py-20 flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 space-y-8 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-sm font-bold uppercase tracking-widest"
        >
          <Play className="w-4 h-4 fill-current" />
          The Movie Night Essential
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter"
        >
          LEVEL UP YOUR <br />
          <span className="text-red-600">CINEMA BITES.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/60 max-w-lg leading-relaxed"
        >
          Don't pause the action. Order your favorite snacks directly to your seat with AI-powered recommendations.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
        >
          <Link 
            to="/menu" 
            className="px-10 py-5 bg-red-600 hover:bg-red-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20 group"
          >
            Explore Menu
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-4 px-6 text-white/50">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="font-medium text-sm">4.9/5 Average User Rating</span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 w-full max-w-lg">
        <AISnackAdvisor />
      </div>
    </div>
  </div>
);

const Menu = ({ onAddToCart }: { onAddToCart: (item: MenuItem) => void }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  if (loading) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-white/50 animate-pulse font-medium tracking-widest uppercase text-sm">Brewing the coffee...</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">CRAFTED <span className="text-red-600">MENU</span></h1>
          <p className="text-white/50 max-w-sm">Premium quality snacks made fresh for every showtime.</p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden hover:border-red-600/30 transition-all hover:bg-white/5 shadow-2xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest">
                  {item.category}
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors uppercase tracking-tight">{item.name}</h3>
                    <span className="text-xl font-black text-white">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                </div>
                
                <button 
                  onClick={() => onAddToCart(item)}
                  className="w-full bg-white/5 hover:bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 group-hover:bg-red-600"
                >
                  <Plus className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const OrderSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-[40px] p-12 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 blur-[60px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-green-600/10 blur-[60px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
              <Zap className="w-12 h-12 text-green-500 fill-current" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase leading-none">LIGHTNING <br/><span className="text-green-500">CONFIRMED.</span></h1>
          <p className="text-white/60 mb-10 leading-relaxed">
            Your snacks are being prepared! Estimated arrival at your seat: <span className="text-white font-bold text-lg underline decoration-green-500/50">1 minute</span>. Keep the orders coming!
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/menu')}
              className="w-full bg-red-600 hover:bg-red-500 py-5 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              Order More
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold transition-all text-sm text-white/40"
            >
              Return Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [seatNumber, setSeatNumber] = useState('');
  const navigate = useNavigate();

  const handleAddToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  useEffect(() => {
    // Poll for status updates
    const pollStatus = async () => {
      try {
        const res = await fetch('/api/orders/live');
        const liveOrders: ActiveOrder[] = await res.json();
        
        setActiveOrders(prev => {
          return prev.map(p => {
            const serverOrder = liveOrders.find(l => l.id === p.id);
            if (serverOrder) {
              return { ...p, status: serverOrder.status };
            }
            if (!serverOrder) {
              // Not on server anymore -> finalized
              return { ...p, isConfirmed: true };
            }
            return p;
          }).filter(p => !p.isConfirmed);
        });
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckout = async () => {
    if (!seatNumber) {
      alert("Please enter your seat number.");
      return;
    }
    
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          total: cartItems.reduce((s, i) => s + (i.price * i.quantity), 0),
          seatNumber: seatNumber
        })
      });
      const data: OrderResponse = await res.json();
      if (data.success) {
        const newOrder: ActiveOrder = {
          id: data.orderId,
          items: [...cartItems],
          timestamp: new Date().toLocaleTimeString(),
          status: 'Preparing',
          estimatedArrival: '1 min',
          seatNumber: seatNumber
        };
        
        setActiveOrders(prev => [newOrder, ...prev]);
        setCartItems([]);
        setCartOpen(false);
        navigate('/success');
      }
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
      <Navbar 
        cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)} 
        activeOrderCount={activeOrders.length}
        onCartClick={() => setCartOpen(true)} 
      />
      
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
        seatNumber={seatNumber}
        setSeatNumber={setSeatNumber}
      />

      <ActiveOrdersTracker orders={activeOrders} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu onAddToCart={handleAddToCart} />} />
        <Route path="/success" element={<OrderSuccess />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 grayscale brightness-50">
              <Popcorn className="text-white w-5 h-5" />
              <span className="text-sm font-bold tracking-tighter">CINEMACRAVINGS</span>
            </div>
            <Link to="/admin" className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-red-500 transition-colors flex items-center gap-2 decoration-transparent">
              <LayoutDashboard className="w-3 h-3" />
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white/20">
            <p>© 2026 THEATER FOOD SYSTEMS</p>
            <p>PRIVACY</p>
            <p>TERMS OF SERVICE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
