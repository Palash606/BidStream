import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, Package, MoreHorizontal, Edit3, Trash2,
    Megaphone, ChevronDown, Download, Plus, X, Filter,
    AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../../stores';
import { toast } from 'react-hot-toast';
import { productAPI } from '../../../api/product';
import AdPlacementModal from './AdPlacementModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
    { id: 1, name: 'Omega Constellation 1968', category: 'Luxury Watches', startingBid: 85000, status: 'Published', addedDate: '2026-02-14' },
    { id: 2, name: 'Monet Watercolor Original Print', category: 'Fine Art & Paintings', startingBid: 250000, status: 'Published', addedDate: '2026-02-20' },
    { id: 3, name: 'Victorian Diamond Solitaire Ring', category: 'Vintage Jewellery', startingBid: 45000, status: 'Draft', addedDate: '2026-03-01' },
    { id: 4, name: 'Sony A7 IV Full-Frame Camera', category: 'Electronics & Gadgets', startingBid: 120000, status: 'Inactive', addedDate: '2026-03-05' },
    { id: 5, name: 'Louis Vuitton Monogram Speedy 30', category: 'Designer Fashion', startingBid: 95000, status: 'Published', addedDate: '2026-03-08' },
    { id: 6, name: 'Gibson Les Paul Standard 1959', category: 'Musical Instruments', startingBid: 380000, status: 'Draft', addedDate: '2026-03-10' },
    { id: 7, name: 'Mughal Emperor Silver Coin 1653', category: 'Rare Coins & Currency', startingBid: 35000, status: 'Published', addedDate: '2026-03-12' },
    { id: 8, name: 'Eames Lounge Chair & Ottoman', category: 'Antique Furniture', startingBid: 180000, status: 'Inactive', addedDate: '2026-03-15' },
    { id: 9, name: 'Patek Philippe Calatrava 1940s', category: 'Luxury Watches', startingBid: 520000, status: 'Published', addedDate: '2026-03-20' },
    { id: 10, name: 'Manuscript — Mughal Era Calligraphy', category: 'Books & Manuscripts', startingBid: 28000, status: 'Draft', addedDate: '2026-03-25' },
];

const ALL_CATEGORIES = ['All', 'Luxury Watches', 'Fine Art & Paintings', 'Vintage Jewellery', 'Electronics & Gadgets', 'Designer Fashion', 'Musical Instruments', 'Rare Coins & Currency', 'Antique Furniture', 'Books & Manuscripts'];
const ALL_STATUSES = ['All', 'Published', 'Draft', 'Inactive'];
const ITEMS_PER_PAGE = 6;

const STATUS_CONFIG = {
    Published: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-500' },
    Draft:     { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   dot: 'bg-amber-500' },
    Inactive:  { color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/25',   dot: 'bg-slate-500' },
};

const CATEGORY_STYLE = {
    'Luxury Watches':       { text: 'text-indigo-400', bg: 'bg-indigo-500/10',  gradient: 'from-indigo-600/20 to-indigo-900/5' },
    'Fine Art & Paintings': { text: 'text-amber-400',  bg: 'bg-amber-500/10',   gradient: 'from-amber-600/20 to-amber-900/5' },
    'Vintage Jewellery':    { text: 'text-pink-400',   bg: 'bg-pink-500/10',    gradient: 'from-pink-600/20 to-pink-900/5' },
    'Electronics & Gadgets':{ text: 'text-emerald-400',bg: 'bg-emerald-500/10', gradient: 'from-emerald-600/20 to-emerald-900/5' },
    'Designer Fashion':     { text: 'text-purple-400', bg: 'bg-purple-500/10',  gradient: 'from-purple-600/20 to-purple-900/5' },
    'Musical Instruments':  { text: 'text-blue-400',   bg: 'bg-blue-500/10',    gradient: 'from-blue-600/20 to-blue-900/5' },
    'Rare Coins & Currency':{ text: 'text-yellow-400', bg: 'bg-yellow-500/10',  gradient: 'from-yellow-600/20 to-yellow-900/5' },
    'Antique Furniture':    { text: 'text-orange-400', bg: 'bg-orange-500/10',  gradient: 'from-orange-600/20 to-orange-900/5' },
    'Books & Manuscripts':  { text: 'text-teal-400',   bg: 'bg-teal-500/10',    gradient: 'from-teal-600/20 to-teal-900/5' },
};

const fmt = (n) => n.toLocaleString('en-IN');

// ─── Small atoms ──────────────────────────────────────────────────────────────

const FilterDropdown = ({ value, options, onChange, icon: Icon, label }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl text-xs font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest"
            >
                {Icon && <Icon size={13} />}
                {value === 'All' ? label : value}
                <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 min-w-[160px] bg-[#0a0a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-30"
                    >
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${value === opt ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Row status dropdown & 3-dot menu ────────────────────────────────────────

const StatusDropdown = ({ status, onChange, rowId, openId, setOpenId }) => {
    const ref = useRef(null);
    const isOpen = openId === `status-${rowId}`;
    const sc = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpenId(null); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpenId(isOpen ? null : `status-${rowId}`)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95 ${sc.bg} ${sc.border} ${sc.color}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {status}
                <ChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 w-36 bg-[#0a0a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-40"
                    >
                        {['Published', 'Draft', 'Inactive'].map(s => {
                            const c = STATUS_CONFIG[s];
                            return (
                                <button
                                    key={s}
                                    onClick={() => { onChange(s); setOpenId(null); }}
                                    className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${s === status ? `${c.color} ${c.bg}` : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                    {s}
                                    {s === status && <CheckCircle size={10} className="ml-auto" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ActionMenu = ({ onEdit, onDelete, onPlaceAd, rowId, openId, setOpenId, menuUp = false }) => {
    const ref = useRef(null);
    const isOpen = openId === `menu-${rowId}`;

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpenId(null); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const posClass = menuUp
        ? 'right-0 bottom-full mb-2'
        : 'right-0 top-full mt-2';
    const initY = menuUp ? 6 : -6;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpenId(isOpen ? null : `menu-${rowId}`)}
                className="p-2 rounded-xl text-slate-600 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
                <MoreHorizontal size={16} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: initY }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: initY }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${posClass} w-44 bg-[#0a0a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-1`}
                    >
                        <MenuItem icon={Edit3} label="Edit Product" color="text-slate-300" onClick={() => { onEdit(); setOpenId(null); }} />
                        <MenuItem icon={Megaphone} label="Place an Ad" color="text-indigo-400" onClick={() => { onPlaceAd(); setOpenId(null); }} />
                        <div className="h-px bg-white/5 mx-3 my-1" />
                        <MenuItem icon={Trash2} label="Delete" color="text-rose-400" onClick={() => { onDelete(); setOpenId(null); }} danger />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, color, onClick, danger }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors ${danger ? 'text-rose-400 hover:bg-rose-500/10' : `${color} hover:bg-white/5 hover:text-white`}`}
    >
        <Icon size={14} className={danger ? 'text-rose-400' : color} />
        {label}
    </button>
);

// ─── Delete Confirmation ──────────────────────────────────────────────────────

const DeleteConfirm = ({ product, onConfirm, onCancel }) => (
    <AnimatePresence>
        {product && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onCancel} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]" />
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 16 }}
                        className="pointer-events-auto w-full max-w-sm bg-[#0a0a1f] border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                                <Trash2 size={16} className="text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white">Delete Product?</h3>
                                <p className="text-[10px] text-slate-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <p className="text-xs font-black text-white truncate">{product.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{product.category}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onCancel} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                Cancel
                            </button>
                            <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            </>
        )}
    </AnimatePresence>
);

// ─── Table Footer (Pagination & Row Control) ───────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const TableFooter = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }) => {
    const [sizeOpen, setSizeOpen] = useState(false);
    const sizeRef = useRef(null);

    useEffect(() => {
        const h = e => { if (sizeRef.current && !sizeRef.current.contains(e.target)) setSizeOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.01] border-t border-white/[0.04]">
            {/* Left: Row Selector Dropdown */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rows per page</span>
                    <div className="relative" ref={sizeRef}>
                        <button
                            onClick={() => setSizeOpen(!sizeOpen)}
                            className="flex items-center gap-3 px-3 py-1.5 bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-lg text-[10px] font-black text-white transition-all uppercase tracking-widest"
                        >
                            {pageSize}
                            <ChevronDown size={11} className={`text-slate-500 transition-transform ${sizeOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {sizeOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: -4 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute bottom-full mb-2 left-0 w-20 bg-[#0a0a1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50"
                                >
                                    {PAGE_SIZE_OPTIONS.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => { onPageSizeChange(size); onPageChange(1); setSizeOpen(false); }}
                                            className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${pageSize === size ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-l border-white/5 pl-6">
                    Showing <span className="text-white">{start}–{end}</span> of <span className="text-white">{totalItems}</span>
                </p>
            </div>

            {/* Right: Pager Controls */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-4">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-2">Page</span>
                    <span className="text-[11px] font-black text-white">{currentPage}</span>
                    <span className="text-[10px] font-black text-slate-700 mx-1">/</span>
                    <span className="text-[10px] font-black text-slate-500">{totalPages}</span>
                </div>

                <div className="flex bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed border-r border-white/5 transition-all"
                        title="First Page"
                    >
                        <ChevronDown size={14} className="rotate-90" />
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed border-r border-white/5 transition-all"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed border-r border-white/5 transition-all"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        title="Last Page"
                    >
                        <ChevronDown size={14} className="-rotate-90" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProductsPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [adProduct, setAdProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getSellerProducts();
            // Map backend product to UI friendly product
            const mapped = (data.content || data).map(p => ({
                id: p.id,
                name: p.name,
                category: p.categoryName || 'Uncategorized',
                startingBid: p.initialPrice,
                status: p.status === 'CANCELED' ? 'Inactive' : p.status === 'ACTIVE' ? 'Published' : 'Draft',
                backendStatus: p.status, // Keep original if needed
                addedDate: p.addedDate ? new Date(p.addedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                views: Math.floor(Math.random() * 500), // Placeholder stats
                bids: p.currentHighestBid > p.initialPrice ? Math.floor(Math.random() * 20) : 0, // Placeholder
                image: p.imageUrls && p.imageUrls.length > 0 ? `http://localhost:8080${p.imageUrls[0]}` : null
            }));
            setProducts(mapped);
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Failed to load your inventory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.isVerifiedSeller) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [user?.isVerifiedSeller]);

    const handleAddProduct = () => {
        if (!user?.isVerifiedSeller) {
            toast.error('Please verify your seller profile before adding products.', {
                icon: '🔒',
                duration: 4000,
            });
            navigate('/seller/verify');
            return;
        }
        navigate('/product/add');
    };

    const handleStatusChange = async (id, newUIStatus) => {
        try {
            let backendStatus = 'DRAFT';
            if(newUIStatus === 'Published') backendStatus = 'ACTIVE';
            else if(newUIStatus === 'Inactive') backendStatus = 'CANCELED';
            
            await productAPI.updateStatus(id, backendStatus);
            setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newUIStatus, backendStatus } : p));
            toast.success(`Status updated to ${newUIStatus}`, { icon: '✓' });
        } catch(error) {
            toast.error('Failed to change status.');
        }
    };

    const handleDelete = async () => {
        if(!deleteTarget) return;
        try {
            await productAPI.deleteProduct(deleteTarget.id);
            setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
            toast.success('Product deleted');
            setDeleteTarget(null);
        } catch(error) {
            toast.error('Failed to delete product.');
        }
    };

    const exportCSV = () => {
        const headers = ['Product Name', 'Category', 'Starting Bid (INR)', 'Status', 'Date Added'];
        const rows = filtered.map(p => [
            p.name,
            p.category,
            p.startingBid,
            p.status,
            p.addedDate
        ]);

        // Create CSV content with a BOM (Byte Order Mark) for Excel compatibility with symbols
        const csvContent = [headers, ...rows].map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(",")).join("\n");
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Generate dynamic filename with date
        const date = new Date().toISOString().split('T')[0];
        const filename = `BidStream_Products_${date}.csv`;

        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Inventory exported to CSV', { icon: '📊' });
        }
    };

    // Filtering
    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchCategory && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    // Clamp currentPage to totalPages when filters reduce results
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

    return (
        <div className="min-h-screen bg-[#050510] text-slate-400">
            <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/seller')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-white flex items-center gap-3">
                                <Package size={20} className="text-indigo-400" />
                                My Products
                            </h1>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{products.length} listings in inventory</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                        >
                            <Download size={13} /> Export CSV
                        </button>
                        <button
                            onClick={handleAddProduct}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <Plus size={14} /> Add Product
                        </button>
                    </div>
                </div>

                {/* ── Filters ── */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 flex-1 min-w-[220px] max-w-sm focus-within:border-indigo-500/40 transition-all group">
                        <Search size={14} className="text-slate-600 group-focus-within:text-indigo-400 transition-colors flex-shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="bg-transparent text-sm text-white placeholder-slate-600 outline-none flex-1"
                        />
                        <AnimatePresence>
                            {search && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => setSearch('')}
                                >
                                    <X size={12} className="text-slate-600 hover:text-white transition-colors" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <FilterDropdown value={categoryFilter} options={ALL_CATEGORIES} onChange={setCategoryFilter} icon={Filter} label="Category" />
                    <FilterDropdown value={statusFilter} options={ALL_STATUSES} onChange={setStatusFilter} icon={Filter} label="Status" />

                    <p className="text-[10px] text-slate-600 font-bold ml-auto tracking-wider">
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* ── Table ── */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] overflow-hidden">

                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
                        <p className="col-span-4 text-[9px] font-black uppercase tracking-widest text-slate-600">Product Name</p>
                        <p className="col-span-2 text-[9px] font-black uppercase tracking-widest text-slate-600">Category</p>
                        <p className="col-span-2 text-[9px] font-black uppercase tracking-widest text-slate-600">Starting Bid</p>
                        <p className="col-span-2 text-[9px] font-black uppercase tracking-widest text-slate-600">Added</p>
                        <p className="col-span-1 text-[9px] font-black uppercase tracking-widest text-slate-600">Status</p>
                        <p className="col-span-1 text-right text-[9px] font-black uppercase tracking-widest text-slate-600">Actions</p>
                    </div>

                    {/* Product Rows */}
                    <div className="divide-y divide-white/[0.04]">
                        <AnimatePresence mode="popLayout">
                            {paginated.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-20 text-center"
                                >
                                    <Package size={40} className="mx-auto text-slate-800 mb-4" />
                                    <p className="text-sm font-black text-slate-600">No products found</p>
                                    <p className="text-[10px] text-slate-700 mt-1">Try adjusting your search or filters</p>
                                    <button
                                        onClick={handleAddProduct}
                                        className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <Plus size={13} /> Add First Product
                                    </button>
                                </motion.div>
                            ) : paginated.map((product, i) => {
                                const catStyle = CATEGORY_STYLE[product.category] || { text: 'text-slate-400', bg: 'bg-slate-500/10', gradient: '' };
                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                                    >
                                        {/* Product Name + thumbnail */}
                                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 bg-gradient-to-br ${catStyle.gradient || 'from-slate-700 to-slate-900'} border border-white/5 flex items-center justify-center`}>
                                                <Package size={14} className={catStyle.text} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-white truncate group-hover:text-indigo-300 transition-colors">
                                                    {product.name}
                                                </p>
                                                <p className="text-[9px] text-slate-600 font-medium mt-0.5">ID #{product.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="col-span-2">
                                            <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${catStyle.bg} ${catStyle.text}`}>
                                                {product.category.split(' ')[0]}
                                            </span>
                                        </div>

                                        {/* Starting Bid */}
                                        <div className="col-span-2">
                                            <p className="text-xs font-black text-white">₹{fmt(product.startingBid)}</p>
                                            <p className="text-[9px] text-slate-600 font-medium">Starting bid</p>
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2">
                                            <p className="text-[10px] text-slate-500 font-bold">
                                                {new Date(product.addedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-1">
                                            <StatusDropdown
                                                status={product.status}
                                                onChange={(s) => handleStatusChange(product.id, s)}
                                                rowId={product.id}
                                                openId={openDropdownId}
                                                setOpenId={setOpenDropdownId}
                                            />
                                        </div>

                                        {/* Action menu */}
                                        <div className="col-span-1 flex justify-end">
                                            <ActionMenu
                                                product={product}
                                                onEdit={() => navigate(`/product/edit/${product.id}`)}
                                                onDelete={() => setDeleteTarget(product)}
                                                onPlaceAd={() => setAdProduct(product)}
                                                rowId={product.id}
                                                openId={openDropdownId}
                                                setOpenId={setOpenDropdownId}
                                                menuUp={i >= paginated.length - 2}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Footer Component inside the table card */}
                    <TableFooter
                        currentPage={safeCurrentPage}
                        totalPages={totalPages}
                        totalItems={filtered.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>

                {/* ── Unverified warning ── */}
                {!user?.isVerifiedSeller && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl"
                    >
                        <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-amber-400">Seller Verification Required</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Verify your identity to publish products and start receiving bids.{' '}
                                <button onClick={() => navigate('/seller/verify')} className="text-indigo-400 font-bold hover:underline">
                                    Verify now →
                                </button>
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ── Modals ── */}
            <DeleteConfirm product={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
            <AdPlacementModal product={adProduct} isOpen={!!adProduct} onClose={() => setAdProduct(null)} />
        </div>
    );
};

export default ProductsPage;
