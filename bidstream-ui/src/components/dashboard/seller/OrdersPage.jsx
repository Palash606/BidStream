import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ShoppingBag, Search, Filter, ChevronDown,
    X, Eye, Download, CheckCircle, Clock, AlertCircle,
    XCircle, Package, User, CreditCard, Calendar, ChevronRight
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ORDERS = [
    {
        id: 'ORD-2841',
        product: { name: 'Omega Constellation 1968', category: 'Luxury Watches' },
        buyer: { name: 'R**** S****', city: 'Mumbai' },
        salePrice: 95000,
        paymentMethod: 'UPI',
        status: 'Completed',
        date: '2026-03-28',
        fulfilled: true,
    },
    {
        id: 'ORD-2790',
        product: { name: 'Mughal Emperor Silver Coin', category: 'Rare Coins & Currency' },
        buyer: { name: 'A**** K****', city: 'Delhi' },
        salePrice: 42500,
        paymentMethod: 'Net Banking',
        status: 'Processing',
        date: '2026-03-30',
        fulfilled: false,
    },
    {
        id: 'ORD-2756',
        product: { name: 'Louis Vuitton Monogram Speedy 30', category: 'Designer Fashion' },
        buyer: { name: 'P**** M****', city: 'Bangalore' },
        salePrice: 120000,
        paymentMethod: 'Credit Card',
        status: 'Completed',
        date: '2026-03-22',
        fulfilled: true,
    },
    {
        id: 'ORD-2701',
        product: { name: 'Victorian Diamond Solitaire Ring', category: 'Vintage Jewellery' },
        buyer: { name: 'S**** T****', city: 'Chennai' },
        salePrice: 58000,
        paymentMethod: 'UPI',
        status: 'Pending',
        date: '2026-04-01',
        fulfilled: false,
    },
    {
        id: 'ORD-2640',
        product: { name: 'Eames Lounge Chair & Ottoman', category: 'Antique Furniture' },
        buyer: { name: 'V**** R****', city: 'Hyderabad' },
        salePrice: 210000,
        paymentMethod: 'Wire Transfer',
        status: 'Disputed',
        date: '2026-03-15',
        fulfilled: false,
    },
    {
        id: 'ORD-2588',
        product: { name: 'Gibson Les Paul Standard 1959', category: 'Musical Instruments' },
        buyer: { name: 'N**** J****', city: 'Pune' },
        salePrice: 425000,
        paymentMethod: 'Net Banking',
        status: 'Completed',
        date: '2026-03-10',
        fulfilled: true,
    },
];

const STATUS_CONFIG = {
    Completed:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
    Processing: { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: Clock },
    Pending:    { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Clock },
    Disputed:   { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    icon: AlertCircle },
    Cancelled:  { color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   icon: XCircle },
};

const CATEGORY_COLORS = {
    'Luxury Watches':       'bg-indigo-500/10 text-indigo-400',
    'Rare Coins & Currency':'bg-yellow-500/10 text-yellow-400',
    'Designer Fashion':     'bg-purple-500/10 text-purple-400',
    'Vintage Jewellery':    'bg-pink-500/10 text-pink-400',
    'Antique Furniture':    'bg-orange-500/10 text-orange-400',
    'Musical Instruments':  'bg-blue-500/10 text-blue-400',
    'Electronics & Gadgets':'bg-emerald-500/10 text-emerald-400',
    'Fine Art & Paintings': 'bg-amber-500/10 text-amber-400',
};

const PLATFORM_FEE = 0.05;
const fmt = (n) => n.toLocaleString('en-IN');

// ─── Side Panel ──────────────────────────────────────────────────────────────

const OrderDetailPanel = ({ order, onClose }) => {
    if (!order) return null;
    const netReceived = Math.round(order.salePrice * (1 - PLATFORM_FEE));
    const fee = order.salePrice - netReceived;
    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
    const StatusIcon = sc.icon;

    return (
        <AnimatePresence>
            {order && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#07071a] border-l border-white/10 z-[70] overflow-y-auto"
                    >
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Order Details</p>
                                    <h2 className="text-lg font-black text-white mt-0.5">{order.id}</h2>
                                </div>
                                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Status */}
                            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${sc.bg} ${sc.border}`}>
                                <StatusIcon size={18} className={sc.color} />
                                <div>
                                    <p className={`text-sm font-black ${sc.color}`}>{order.status}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Order placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Product */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</p>
                                <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[order.product.category] || 'bg-slate-500/10 text-slate-400'}`}>
                                        <Package size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white leading-tight">{order.product.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{order.product.category}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buyer */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Buyer</p>
                                <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <User size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white">{order.buyer.name}</p>
                                        <p className="text-[10px] text-slate-500">{order.buyer.city} · {order.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Financial breakdown */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Breakdown</p>
                                <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400">Winning Bid</span>
                                        <span className="text-sm font-black text-white">₹{fmt(order.salePrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400">Platform Fee (5%)</span>
                                        <span className="text-[11px] font-bold text-rose-400">−₹{fmt(fee)}</span>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-white">You Receive</span>
                                        <span className="text-lg font-black text-emerald-400">₹{fmt(netReceived)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {order.status === 'Disputed' && (
                                <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-2xl space-y-2">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle size={10} /> Dispute Active</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">This order is under review. Our support team will contact both parties within 48 hours.</p>
                                </div>
                            )}
                            {order.status === 'Pending' && (
                                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                                    Confirm Fulfillment
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OrdersPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusDropOpen, setStatusDropOpen] = useState(false);

    const statuses = ['All', 'Pending', 'Processing', 'Completed', 'Disputed'];

    const filtered = MOCK_ORDERS.filter(o => {
        const matchSearch = o.product.name.toLowerCase().includes(search.toLowerCase()) ||
            o.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalRevenue = MOCK_ORDERS.filter(o => o.status === 'Completed').reduce((s, o) => s + o.salePrice, 0);
    const totalNet = Math.round(totalRevenue * (1 - PLATFORM_FEE));
    const completedCount = MOCK_ORDERS.filter(o => o.status === 'Completed').length;
    const pendingCount = MOCK_ORDERS.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

    const exportCSV = () => {
        const rows = [
            ['Order ID', 'Product', 'Buyer City', 'Sale Price', 'Net Received', 'Status', 'Date'],
            ...filtered.map(o => [
                o.id, o.product.name, o.buyer.city,
                o.salePrice, Math.round(o.salePrice * 0.95), o.status, o.date
            ])
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'bidstream_orders.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#050510] text-slate-400">
            <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/seller')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-white flex items-center gap-3">
                                <ShoppingBag size={20} className="text-blue-400" />
                                Order Management
                            </h1>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">Post-sale transaction tracking</p>
                        </div>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                    >
                        <Download size={13} /> Export CSV
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard label="Total Earned (Gross)" value={`₹${fmt(totalRevenue)}`} sub="from completed orders" color="text-white" />
                    <SummaryCard label="Net Received" value={`₹${fmt(totalNet)}`} sub="after 5% platform fee" color="text-emerald-400" />
                    <SummaryCard label="Completed Orders" value={completedCount} sub="successfully fulfilled" color="text-blue-400" />
                    <SummaryCard label="Pending Action" value={pendingCount} sub="require your attention" color="text-amber-400" />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 flex-1 min-w-[200px] max-w-sm focus-within:border-indigo-500/40 transition-all">
                        <Search size={15} className="text-slate-600 flex-shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search orders or products..."
                            className="bg-transparent text-sm text-white placeholder-slate-600 outline-none flex-1"
                        />
                        {search && <button onClick={() => setSearch('')}><X size={12} className="text-slate-600 hover:text-white transition-colors" /></button>}
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <button
                            onClick={() => setStatusDropOpen(o => !o)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-black text-slate-400 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
                        >
                            <Filter size={13} />
                            {statusFilter}
                            <ChevronDown size={12} className={`transition-transform ${statusDropOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {statusDropOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="absolute top-full mt-2 left-0 w-40 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 py-1"
                                >
                                    {statuses.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => { setStatusFilter(s); setStatusDropOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${statusFilter === s ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="text-[11px] text-slate-600 font-bold ml-auto">
                        {filtered.length} of {MOCK_ORDERS.length} orders
                    </p>
                </div>

                {/* Table */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
                        {['Order ID', 'Product', 'Buyer', 'Sale Price', 'Net Received', 'Status', 'Date', ''].map((h, i) => (
                            <p key={i} className={`text-[9px] font-black text-slate-600 uppercase tracking-widest ${i === 0 ? 'col-span-2' : i === 1 ? 'col-span-2' : i === 7 ? 'col-span-1 text-right' : 'col-span-1'}`}>
                                {h}
                            </p>
                        ))}
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/[0.04]">
                        <AnimatePresence>
                            {filtered.length === 0 ? (
                                <div className="py-16 text-center">
                                    <ShoppingBag size={32} className="mx-auto text-slate-700 mb-3" />
                                    <p className="text-sm font-black text-slate-600">No orders found</p>
                                    <p className="text-[10px] text-slate-700 mt-1">Try adjusting your filters</p>
                                </div>
                            ) : filtered.map((order, i) => {
                                const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                                const StatusIcon = sc.icon;
                                const net = Math.round(order.salePrice * (1 - PLATFORM_FEE));
                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                                    >
                                        {/* Order ID */}
                                        <div className="col-span-2">
                                            <p className="text-xs font-black text-indigo-400">{order.id}</p>
                                            <p className="text-[9px] text-slate-600 font-medium uppercase mt-0.5">{order.paymentMethod}</p>
                                        </div>

                                        {/* Product */}
                                        <div className="col-span-2 min-w-0">
                                            <p className="text-xs font-black text-white truncate">{order.product.name}</p>
                                            <p className={`text-[9px] font-bold mt-0.5 truncate ${(CATEGORY_COLORS[order.product.category] || '').split(' ')[1]}`}>
                                                {order.product.category}
                                            </p>
                                        </div>

                                        {/* Buyer */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                    <User size={10} className="text-slate-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-black text-slate-300 truncate">{order.buyer.name}</p>
                                                    <p className="text-[9px] text-slate-600">{order.buyer.city}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sale Price */}
                                        <div className="col-span-1">
                                            <p className="text-xs font-black text-white">₹{fmt(order.salePrice)}</p>
                                        </div>

                                        {/* Net Received */}
                                        <div className="col-span-1">
                                            <p className="text-xs font-black text-emerald-400">₹{fmt(net)}</p>
                                            <p className="text-[9px] text-slate-600">−5%</p>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.border} ${sc.color}`}>
                                                <StatusIcon size={9} />
                                                {order.status}
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-1">
                                            <p className="text-[10px] text-slate-500 font-bold">
                                                {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>

                                        {/* Action */}
                                        <div className="col-span-1 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Differentiation note */}
                <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <ShoppingBag size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        <span className="text-white font-bold">Orders</span> track your post-sale transactions — winning bids, buyer details, payment status, and your net earnings after fees.
                        To manage your active listings, go to{' '}
                        <button onClick={() => navigate('/products')} className="text-indigo-400 font-bold hover:underline">Products</button>.
                    </p>
                </div>
            </div>

            <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
    );
};

const SummaryCard = ({ label, value, sub, color }) => (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-1">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
        <p className="text-[9px] text-slate-600 font-medium">{sub}</p>
    </div>
);

export default OrdersPage;
