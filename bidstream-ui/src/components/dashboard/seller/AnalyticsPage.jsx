import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, ChevronDown, Download,
    BarChart3, PieChart, Zap, Package, DollarSign,
    Activity, Target, ArrowUpRight, Sparkles, RefreshCw, Clock, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../../stores';
import { productAPI } from '../../../api/product';

// ─── Period Options ──────────────────────────────────────────────────────────

const PERIODS = [
    { key: '24H', label: 'Last 24 Hours' },
    { key: 'WEEK', label: 'Last Week' },
    { key: 'MONTH', label: 'Last Month' },
    { key: 'YEAR', label: 'Last Year' },
];

const PALETTE = ['#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#3b82f6', '#06b6d4'];

const fmt = (n) => {
    if (!n || isNaN(n)) return '₹0';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${Math.round(n)}`;
};

const fmtFull = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

// ─── Chart Components ─────────────────────────────────────────────────────────

const BarChart = ({ data, height = 200, color = '#6366f1', isCurrency = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600 space-y-2" style={{ height }}>
                <BarChart3 size={32} className="opacity-30" />
                <p className="text-xs font-semibold">No bidding activity recorded for this period yet</p>
            </div>
        );
    }

    const max = Math.max(...data.map(d => d.value), 1);
    const gridLines = [0, 25, 50, 75, 100];

    return (
        <div className="relative" style={{ height: height + 44 }}>
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none" style={{ bottom: 28, top: 0 }}>
                {gridLines.map(pct => (
                    <div
                        key={pct}
                        className="absolute left-10 right-0 border-t border-white/[0.04]"
                        style={{ bottom: `${pct}%` }}
                    >
                        <span className="absolute right-[calc(100%+4px)] -translate-y-1/2 text-[8px] font-bold text-slate-700 whitespace-nowrap">
                            {pct === 0 ? '0' : isCurrency ? fmt(Math.round(max * pct / 100)) : Math.round(max * pct / 100)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Bars */}
            <div className="absolute bottom-7 left-10 right-0 flex items-end gap-2">
                {data.map((d, i) => {
                    const barH = max > 0 ? Math.max((d.value / max) * height, 4) : 4;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap pointer-events-none shadow-xl">
                                {d.label}: {isCurrency ? fmtFull(d.value) : `${d.value} bids`}
                            </div>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: barH }}
                                transition={{ duration: 0.5, delay: i * 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="w-full rounded-t-lg overflow-hidden flex-shrink-0 cursor-pointer group-hover:brightness-125 transition-all"
                                style={{
                                    background: `linear-gradient(to top, ${color}aa, ${color})`,
                                    minHeight: 4,
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* X labels */}
            <div className="absolute bottom-0 left-10 right-0 flex items-end gap-2">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex justify-center">
                        <span className="text-[9px] font-bold text-slate-500 uppercase truncate text-center px-0.5">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DonutChart = ({ segments, size = 180, strokeWidth = 28 }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => { setVisible(true); }, [segments]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    const totalPct = segments.reduce((sum, s) => sum + s.percent, 0);

    let currentOffset = 0;
    const rendered = segments.map(seg => {
        const pct = totalPct > 0 ? (seg.percent / totalPct) : (1 / segments.length);
        const dashLen = pct * circumference;
        const res = { ...seg, offset: -currentOffset, dashLen };
        currentOffset += dashLen;
        return res;
    });

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="rotate-[-90deg]">
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
                {rendered.map((seg, i) => (
                    <circle
                        key={i}
                        cx={center} cy={center} r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${visible ? seg.dashLen : 0} ${circumference}`}
                        strokeDashoffset={seg.offset}
                        style={{
                            transition: `stroke-dasharray 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.1}s`,
                            strokeLinecap: 'butt',
                        }}
                    />
                ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">{segments.length}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Categories</span>
            </div>
        </div>
    );
};

// ─── Stat Card Component ──────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon, color = 'text-indigo-400', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
                {icon}
            </div>
        </div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-white mt-1">{value}</p>
        {sub && <p className="text-[9px] text-slate-600 mt-1">{sub}</p>}
    </motion.div>
);

// ─── Period Dropdown ──────────────────────────────────────────────────────────

const PeriodDropdown = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const current = PERIODS.find(p => p.key === value);

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl text-[11px] font-black text-slate-300 hover:text-white transition-all uppercase tracking-widest"
            >
                {current?.label}
                <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-44 bg-[#0a0a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-30"
                    >
                        {PERIODS.map(p => (
                            <button
                                key={p.key}
                                onClick={() => { onChange(p.key); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${value === p.key ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Analytics Page ──────────────────────────────────────────────────────

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const [period, setPeriod] = useState('WEEK');
    const [chartTab, setChartTab] = useState('revenue');
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(null);
    const [analytics, setAnalytics] = useState({
        grossMerchandiseValue: 0,
        platformCut: 0,
        netEarnings: 0,
        pendingPayout: 0,
        totalLots: 0,
        activeLotsCount: 0,
        soldLotsCount: 0,
        totalBidsReceived: 0,
        categoryBreakdown: [],
        timeSeries: []
    });

    const fetchAnalytics = useCallback(async (selectedPeriod) => {
        try {
            const data = await productAPI.getSellerAnalytics(selectedPeriod);
            if (data) {
                setAnalytics(data);
                setLastSync(new Date());
            }
        } catch (err) {
            console.error('Failed to load seller analytics:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchAnalytics(period);

        // Near-live updates: polling every 30s to match Redis cache duration
        const timer = setInterval(() => {
            fetchAnalytics(period);
        }, 30000);

        return () => clearInterval(timer);
    }, [period, fetchAnalytics]);

    const username = user?.email?.split('@')[0] || 'Seller';

    // Format chart data based on selected tab
    const chartData = (analytics.timeSeries || []).map(item => ({
        label: item.timeLabel,
        value: chartTab === 'revenue' ? item.volume : item.bidCount
    }));

    // Format category breakdown for Donut Chart
    const categorySegments = (analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0)
        ? analytics.categoryBreakdown.map((cat, i) => ({
            name: cat.categoryName,
            percent: cat.percentage,
            soldCount: cat.soldCount,
            volume: cat.totalVolume,
            color: PALETTE[i % PALETTE.length]
        }))
        : [
            { name: 'Luxury Watches', percent: 40, soldCount: 0, volume: 0, color: '#6366f1' },
            { name: 'Fine Art', percent: 30, soldCount: 0, volume: 0, color: '#f59e0b' },
            { name: 'Jewellery', percent: 20, soldCount: 0, volume: 0, color: '#ec4899' },
            { name: 'Others', percent: 10, soldCount: 0, volume: 0, color: '#10b981' }
        ];

    return (
        <div className="min-h-screen bg-[#050510] text-slate-400 pb-16">
            <div className="max-w-[1500px] mx-auto px-6 py-8 space-y-6">

                {/* ── Header ── */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/seller')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-white flex items-center gap-3">
                                Dynamic Seller Analytics <span className="text-2xl">📊</span>
                            </h1>
                            <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-2">
                                Store: <span className="text-indigo-400 font-bold">{username}</span>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Near-Live (30s Cache)
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setLoading(true); fetchAnalytics(period); }}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all"
                            title="Refresh Analytics"
                        >
                            <RefreshCw size={12} className={loading ? 'animate-spin text-indigo-400' : ''} />
                            Sync
                        </button>
                        <PeriodDropdown value={period} onChange={setPeriod} />
                    </div>
                </div>

                {/* ── Top Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Net Profit — MAIN CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-900/40 via-indigo-900/10 to-transparent border border-indigo-500/25 rounded-[2rem] p-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-8 h-8 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                    <DollarSign size={14} className="text-indigo-400" />
                                </div>
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    95% Payout
                                </span>
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Net Seller Earnings</p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={analytics.netEarnings}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="text-2xl font-black text-white mt-1"
                                >
                                    {fmt(analytics.netEarnings)}
                                </motion.p>
                            </AnimatePresence>
                            <p className="text-[9px] text-slate-500 mt-1">
                                GMV {fmt(analytics.grossMerchandiseValue)} · 5% Cut {fmt(analytics.platformCut)}
                            </p>
                        </div>
                    </motion.div>

                    <StatCard
                        label="Gross Merchandise Value"
                        value={fmt(analytics.grossMerchandiseValue)}
                        sub={`${analytics.soldLotsCount} sold lots`}
                        icon={<TrendingUp size={14} />}
                        color="text-emerald-400"
                        delay={0.1}
                    />

                    <StatCard
                        label="Total Bids Received"
                        value={analytics.totalBidsReceived}
                        sub={`${analytics.activeLotsCount} lots currently live`}
                        icon={<Zap size={14} />}
                        color="text-amber-400"
                        delay={0.15}
                    />

                    <StatCard
                        label="Pending Settlement"
                        value={fmt(analytics.pendingPayout)}
                        sub="Awaiting winner payment"
                        icon={<Clock size={14} />}
                        color="text-purple-400"
                        delay={0.2}
                    />
                </div>

                {/* ── Main Charts Grid ── */}
                <div className="grid grid-cols-12 gap-6">

                    {/* Bar Chart — left 8 cols */}
                    <div className="col-span-12 xl:col-span-8 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 space-y-5">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h3 className="text-sm font-black text-white flex items-center gap-2">
                                    <BarChart3 size={16} className="text-indigo-400" />
                                    {chartTab === 'revenue' ? 'Revenue Progression' : 'Time-Based Bid Velocity'}
                                </h3>
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                                    {PERIODS.find(p => p.key === period)?.label} · Live database aggregation
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Tabs */}
                                <div className="flex bg-black/30 border border-white/5 rounded-xl p-1">
                                    {[
                                        { key: 'revenue', label: 'Revenue (₹)' },
                                        { key: 'bids', label: 'Bid Velocity' }
                                    ].map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => setChartTab(t.key)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartTab === t.key ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${period}-${chartTab}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <BarChart
                                    data={chartData}
                                    height={200}
                                    color={chartTab === 'revenue' ? '#6366f1' : '#3b82f6'}
                                    isCurrency={chartTab === 'revenue'}
                                />
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[9px] text-slate-600 font-semibold">
                            <span>* Cached in Redis for 30 seconds to prevent DB lock contention during live bidding.</span>
                            {lastSync && <span>Last sync: {lastSync.toLocaleTimeString()}</span>}
                        </div>
                    </div>

                    {/* Donut Chart — right 4 cols */}
                    <div className="col-span-12 xl:col-span-4 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                <PieChart size={15} className="text-amber-400" /> Categories Sold
                            </h3>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                                Revenue breakdown by product category
                            </p>
                        </div>

                        <div className="flex justify-center py-2">
                            <DonutChart segments={categorySegments} size={170} strokeWidth={28} />
                        </div>

                        {/* Legend */}
                        <div className="space-y-2 mt-2">
                            {categorySegments.map((seg, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors truncate">
                                            {seg.name} {seg.soldCount ? `(${seg.soldCount})` : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {seg.volume > 0 && <span className="text-[9px] text-slate-500 font-medium">{fmt(seg.volume)}</span>}
                                        <span className="text-[10px] font-black text-white">{seg.percent}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Financial Transparency Banner ── */}
                <div className="bg-gradient-to-r from-emerald-950/20 via-indigo-950/20 to-purple-950/20 border border-white/5 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white">Guaranteed Payout Settlement</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Platform retains a flat 5% commission on finalized lots. 95% net revenue is credited upon buyer settlement.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[9px] uppercase font-bold text-slate-500">Gross Sold</p>
                            <p className="text-sm font-black text-white">{fmt(analytics.grossMerchandiseValue)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] uppercase font-bold text-slate-500">Platform Cut</p>
                            <p className="text-sm font-black text-indigo-400">- {fmt(analytics.platformCut)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] uppercase font-bold text-emerald-400">Net Payable</p>
                            <p className="text-sm font-black text-emerald-400">{fmt(analytics.netEarnings)}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsPage;
