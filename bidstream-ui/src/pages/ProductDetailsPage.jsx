import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Clock, Gavel, Shield, Tag, MapPin,
    Calendar, Box, Info, Share2, Heart, ExternalLink,
    ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
    Edit3, Trash2, Zap, Award, Sparkles, MessageSquare
} from 'lucide-react';
import { productAPI } from '../api/product';
import { toast } from 'react-hot-toast';

// ─── Helpers & Constants ───────────────────────────────────────────────────

const AUCTION_TYPES = {
    'THREE_HAMMER': { label: 'Hammer Auction', emoji: '🔨', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    'TIMED': { label: 'Timed Auction', emoji: '⏳', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    'ENGLISH': { label: 'Hammer Auction', emoji: '🔨', color: 'text-rose-400', bg: 'bg-rose-500/10' },
};

const PRODUCT_STATUS = {
    'ACTIVE': { label: 'Live', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    'DRAFT': { label: 'Draft', color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
    'SOLD': { label: 'Sold', color: 'text-indigo-400', bg: 'bg-indigo-500/10', dot: 'bg-indigo-500' },
    'SCHEDULED': { label: 'Scheduled', color: 'text-sky-400', bg: 'bg-sky-500/10', dot: 'bg-sky-500' },
};

const fmt = (n) => n?.toLocaleString('en-IN') || '0';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImgIdx, setActiveImgIdx] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [insights, setInsights] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await productAPI.getProduct(id);
                setProduct(data);
            } catch (err) {
                toast.error('Product not found');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id, navigate]);

    useEffect(() => {
        if (!product || product.auctionType === 'THREE_HAMMER' || !product.auctionEndTime) {
            setTimeRemaining('N/A (3-Hammer)');
            return;
        }

        const tick = () => {
            const end = new Date(product.auctionEndTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;
            if (diff <= 0) { setTimeRemaining('EXPIRED'); return; }
            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeRemaining(`${hrs}h ${mins}m ${secs}s`);
        };
        const timer = setInterval(tick, 1000);
        tick();
        return () => clearInterval(timer);
    }, [product]);

    const handleAnalyze = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setInsights([
                "Valuation is spot-on for the premium market. 📈",
                "Suggest adding a video of the moving parts for 45% better engagement. 🎥",
                "The Luxury category is trending peak right now—expect high activity. 🔥"
            ]);
            toast.success("BidBuddy insights generated!");
        }, 2000);
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this listing permanently?")) return;
        try {
            await productAPI.deleteProduct(id);
            toast.success('Deleted permanently');
            navigate('/products');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    if (!product) return null;

    const type = AUCTION_TYPES[product.auctionType] || AUCTION_TYPES.TIMED;
    const stat = PRODUCT_STATUS[product.status] || PRODUCT_STATUS.DRAFT;
    const images = product.imageUrls || [];

    const getFullUrl = (img) => {
        if (!img) return '';
        if (img.startsWith('http')) return img;
        const cleanPath = img.startsWith('/') ? img : `/${img}`;
        return `http://localhost:8080${cleanPath}`;
    };

    const currentImage = images.length > 0 ? getFullUrl(images[activeImgIdx]) : null;

    return (
        <div className="min-h-screen bg-[#07070f] text-slate-300 font-sans selection:bg-indigo-500/30">
            {/* ── Background Aesthetics ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <div className="relative max-w-6xl mx-auto px-8 py-12">

                {/* ── Navigation ── */}
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={() => navigate('/products')}
                        className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/product/${product.id}/update`)}
                            className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white transition-all shadow-xl text-[11px] font-black uppercase tracking-widest"
                        >
                            <Edit3 size={16} /> Update Product
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white text-rose-500 transition-all shadow-xl shadow-rose-500/5 hover:shadow-rose-500/20 text-[11px] font-black uppercase tracking-widest"
                        >
                            <Trash2 size={16} /> Delete Listing
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* ── Media Gallery ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative group bg-gradient-to-br from-white/[0.05] to-transparent rounded-[2rem] border border-white/10 aspect-square overflow-hidden flex items-center justify-center p-8 backdrop-blur-md shadow-2xl">
                            <motion.img
                                key={activeImgIdx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={currentImage}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImgIdx(idx)}
                                    className={`relative w-16 h-16 rounded-2xl border-2 transition-all p-1 overflow-hidden ${idx === activeImgIdx ? 'border-indigo-500 bg-indigo-500/10 scale-110 shadow-lg shadow-indigo-500/20' : 'border-white/5 bg-white/5 opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={getFullUrl(img)} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Product Intelligence ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${stat.bg} ${stat.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} animate-pulse`} />
                                        {stat.label}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-l border-white/10 pl-3">
                                        {product.categoryName || 'General Listing'}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
                                    {product.name}
                                </h1>
                                <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium max-w-lg">
                                    {product.description || "Sophisticated craftsmanship meets timeless utility."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white/[0.03] rounded-[1.5rem] border border-white/10 backdrop-blur-sm group hover:bg-white/[0.05] transition-all">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Tag size={12} className="text-indigo-400" /> Reserve Price
                                    </p>
                                    <div className="text-2xl font-black text-white">₹{fmt(product.initialPrice)}</div>
                                </div>
                                <div className="p-6 bg-white/[0.03] rounded-[1.5rem] border border-white/10 backdrop-blur-sm group hover:bg-white/[0.05] transition-all">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Clock size={12} className={product.auctionType === 'THREE_HAMMER' ? 'text-rose-400' : 'text-sky-400'} />
                                        {product.auctionType === 'THREE_HAMMER' ? 'Auction Flow' : 'Timer'}
                                    </p>
                                    <div className={`text-2xl font-black tabular-nums ${product.auctionType === 'THREE_HAMMER' ? 'text-rose-400' : 'text-indigo-400'}`}>
                                        {timeRemaining}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-12 pt-4 border-t border-white/5">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sale Type</span>
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        <span className="text-lg">{type.emoji}</span> {type.label}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Brand/Maker</span>
                                    <p className="text-sm font-bold text-white truncate">{product.manufacturer || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Volume (Dim)</span>
                                    <p className="text-sm font-bold text-white">{product.dimensions || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Net Weight</span>
                                    <p className="text-sm font-bold text-white">
                                        {product.weight ? (/^\d+(\.\d+)?$/.test(product.weight.toString()) ? `${product.weight}g` : product.weight) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Trust Architecture */}
                            <div className="flex gap-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex-1">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner">
                                        <Shield size={20} />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">BidStream Secured</p>
                                        <p className="text-[9px] text-emerald-500/60 font-black uppercase">Verified Origin</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex-1">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 shadow-inner">
                                        <Award size={20} />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">Prime Appraisal</p>
                                        <p className="text-[9px] text-amber-500/60 font-black uppercase">Expert Valued</p>
                                    </div>
                                </div>
                            </div>

                            {/* BidBuddy AI Experience */}
                            <div className="mt-auto pt-8">
                                <div className="relative p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-[2rem] overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Sparkles size={60} className="text-indigo-400" />
                                    </div>
                                    <div className="relative flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-white">
                                                <Zap size={16} className="text-indigo-400" />
                                                <span className="text-xs font-black uppercase tracking-widest">BidBuddy AI Insights</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Market condition analysis & listing advice</p>
                                        </div>
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={analyzing}
                                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black text-white tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
                                        >
                                            {analyzing ? 'DIGESTING DATA...' : 'REVEAL STRATEGY'}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {insights && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="mt-6 space-y-3"
                                            >
                                                {insights.map((msg, i) => (
                                                    <motion.div
                                                        initial={{ x: -10, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        key={i}
                                                        className="flex gap-3 items-start p-3 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-medium text-slate-300 leading-snug group/msg hover:bg-white/10 transition-colors"
                                                    >
                                                        <MessageSquare size={14} className="mt-0.5 text-indigo-400 group-hover/msg:scale-110 transition-transform" />
                                                        {msg}
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
