import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, ChevronDown, Download,
    BarChart3, PieChart, Zap, Package, DollarSign,
    Activity, Target, ArrowUpRight, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../../stores';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const REVENUE_DATA = {
    '24H': [
        { label: '12 AM', value: 8500 },  { label: '4 AM', value: 2200 },
        { label: '8 AM', value: 45000 },  { label: '12 PM', value: 82000 },
        { label: '4 PM', value: 61000 },  { label: '8 PM', value: 95500 },
    ],
    'WEEK': [
        { label: 'Mon', value: 42000 }, { label: 'Tue', value: 58000 },
        { label: 'Wed', value: 35000 }, { label: 'Thu', value: 72000 },
        { label: 'Fri', value: 91000 }, { label: 'Sat', value: 88000 },
        { label: 'Sun', value: 110000 },
    ],
    'MONTH': [
        { label: 'Week 1', value: 280000 }, { label: 'Week 2', value: 350000 },
        { label: 'Week 3', value: 420000 }, { label: 'Week 4', value: 510000 },
    ],
    '6M': [
        { label: 'Nov', value: 850000 }, { label: 'Dec', value: 1200000 },
        { label: 'Jan', value: 980000 }, { label: 'Feb', value: 1400000 },
        { label: 'Mar', value: 1650000 }, { label: 'Apr', value: 1890000 },
    ],
    'YEAR': [
        { label: 'Apr', value: 450000 }, { label: 'May', value: 620000 },
        { label: 'Jun', value: 580000 }, { label: 'Jul', value: 750000 },
        { label: 'Aug', value: 890000 }, { label: 'Sep', value: 820000 },
        { label: 'Oct', value: 1100000 }, { label: 'Nov', value: 950000 },
        { label: 'Dec', value: 1350000 }, { label: 'Jan', value: 1200000 },
        { label: 'Feb', value: 1580000 }, { label: 'Mar', value: 1850000 },
    ],
};

const BIDS_DATA = {
    '24H':  [{ label: '12 AM', value: 3 }, { label: '4 AM', value: 1 }, { label: '8 AM', value: 12 }, { label: '12 PM', value: 28 }, { label: '4 PM', value: 19 }, { label: '8 PM', value: 34 }],
    'WEEK': [{ label: 'Mon', value: 45 }, { label: 'Tue', value: 61 }, { label: 'Wed', value: 38 }, { label: 'Thu', value: 72 }, { label: 'Fri', value: 95 }, { label: 'Sat', value: 88 }, { label: 'Sun', value: 112 }],
    'MONTH':[{ label: 'Week 1', value: 210 }, { label: 'Week 2', value: 285 }, { label: 'Week 3', value: 340 }, { label: 'Week 4', value: 410 }],
    '6M':  [{ label: 'Nov', value: 820 }, { label: 'Dec', value: 1150 }, { label: 'Jan', value: 940 }, { label: 'Feb', value: 1320 }, { label: 'Mar', value: 1560 }, { label: 'Apr', value: 1800 }],
    'YEAR':[{ label: 'Apr', value: 430 }, { label: 'May', value: 590 }, { label: 'Jun', value: 550 }, { label: 'Jul', value: 710 }, { label: 'Aug', value: 850 }, { label: 'Sep', value: 780 }, { label: 'Oct', value: 1050 }, { label: 'Nov', value: 910 }, { label: 'Dec', value: 1290 }, { label: 'Jan', value: 1140 }, { label: 'Feb', value: 1510 }, { label: 'Mar', value: 1760 }],
};

const GROSS_BY_PERIOD = {
    '24H': 294200, 'WEEK': 496000, 'MONTH': 1560000, '6M': 7970000, 'YEAR': 12590000,
};

const MOCK_PRODUCT_COUNT = 8;

const CATEGORY_SEGMENTS = [
    { name: 'Luxury Watches',       percent: 34, color: '#6366f1', light: '#818cf8' },
    { name: 'Fine Art',             percent: 22, color: '#f59e0b', light: '#fcd34d' },
    { name: 'Vintage Jewellery',    percent: 18, color: '#ec4899', light: '#f472b6' },
    { name: 'Electronics',          percent: 14, color: '#10b981', light: '#34d399' },
    { name: 'Designer Fashion',     percent: 8,  color: '#8b5cf6', light: '#a78bfa' },
    { name: 'Others',               percent: 4,  color: '#475569', light: '#64748b' },
];

const TOP_PRODUCTS = [
    { name: 'Omega Constellation 1968', category: 'Luxury Watches', revenue: 95000, pct: 100 },
    { name: 'Gibson Les Paul 1959',      category: 'Musical Instruments', revenue: 425000, pct: 85 },
    { name: 'Mughal Silver Coin',        category: 'Rare Coins', revenue: 42500, pct: 62 },
    { name: 'LV Monogram Speedy 30',     category: 'Designer Fashion', revenue: 120000, pct: 48 },
    { name: 'Monet Watercolor Print',    category: 'Fine Art', revenue: 250000, pct: 38 },
];

const MARKET_TRENDS = [
    { rank: '01', emoji: '🕰', name: 'Luxury Watches',    growth: '+34%', insight: 'Highest avg winning bids. Collectors chase pre-1970 Swiss pieces.', color: '#6366f1' },
    { rank: '02', emoji: '💎', name: 'Vintage Jewellery', growth: '+28%', insight: 'Victorian-era pieces trending with metro buyers. Great ROI.', color: '#ec4899' },
    { rank: '03', emoji: '🎨', name: 'Fine Art & Paintings', growth: '+22%', insight: 'Digital collector wave driving demand. Prints + oils both strong.', color: '#f59e0b' },
    { rank: '04', emoji: '📱', name: 'Electronics & Gadgets', growth: '+19%', insight: 'Fastest-moving category. Refurb premium devices clear in 24h.', color: '#10b981' },
    { rank: '05', emoji: '👗', name: 'Designer Fashion',  growth: '+16%', insight: 'Rising in Tier-1 cities. Authenticated luxury brands top sellers.', color: '#8b5cf6' },
];

const PERIODS = [
    { key: '24H', label: 'Last 24 Hours' },
    { key: 'WEEK', label: 'Last Week' },
    { key: 'MONTH', label: 'Last Month' },
    { key: '6M', label: 'Last 6 Months' },
    { key: 'YEAR', label: 'Last Year' },
];

const fmt = (n) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
};

const fmtFull = (n) => `₹${n.toLocaleString('en-IN')}`;

// ─── Chart Components ─────────────────────────────────────────────────────────

const BarChart = ({ data, height = 200, color = '#6366f1', isCurrency = true }) => {
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
            <div className="absolute bottom-7 left-10 right-0 flex items-end gap-1.5">
                {data.map((d, i) => {
                    const barH = max > 0 ? Math.max((d.value / max) * height, 2) : 2;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap pointer-events-none shadow-xl">
                                {d.label}: {isCurrency ? fmtFull(d.value) : d.value}
                            </div>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: barH }}
                                transition={{ duration: 0.5, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="w-full rounded-t-lg overflow-hidden flex-shrink-0 cursor-pointer group-hover:brightness-110 transition-filter"
                                style={{
                                    background: `linear-gradient(to top, ${color}aa, ${color})`,
                                    minHeight: 2,
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* X labels */}
            <div className="absolute bottom-0 left-10 right-0 flex items-end gap-1.5">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex justify-center">
                        <span className="text-[8px] font-bold text-slate-600 uppercase truncate text-center px-0.5">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DonutChart = ({ segments, size = 180, strokeWidth = 28 }) => {
    const [visible, setVisible] = useState(false);
    const center = size / 2;
    const radius = center - strokeWidth / 2 - 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 300);
        return () => clearTimeout(t);
    }, []);

    // Pre-compute segment offsets to avoid mutating variables during render
    const segmentData = segments.reduce((acc, seg) => {
        const segLen = (seg.percent / 100) * circumference;
        const gap = 4;
        const dashLen = Math.max(0, segLen - gap);
        const offset = -(acc.cumulative);
        acc.result.push({ dashLen, offset, color: seg.color });
        acc.cumulative += segLen;
        return acc;
    }, { cumulative: 0, result: [] }).result;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: 'rotate(-90deg)' }}
            >
                {/* Track */}
                <circle
                    cx={center} cy={center} r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={strokeWidth}
                />
                {segmentData.map((seg, i) => (
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
            {/* Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">{segments.length}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Categories</span>
            </div>
        </div>
    );
};

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

// ─── Main Page ────────────────────────────────────────────────────────────────

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const [period, setPeriod] = useState('WEEK');
    const [chartTab, setChartTab] = useState('revenue');

    const isNewSeller = MOCK_PRODUCT_COUNT < 5;
    const gross = GROSS_BY_PERIOD[period] || 0;
    const net = Math.round(gross * 0.95);
    const fee = gross - net;
    const chartData = chartTab === 'revenue' ? REVENUE_DATA[period] : BIDS_DATA[period];
    const isCurrency = chartTab === 'revenue';
    const barColor = chartTab === 'revenue' ? '#6366f1' : '#3b82f6';

    const username = user?.email?.split('@')[0] || 'Seller';

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
                                Your Analytics <span className="text-2xl">📊</span>
                            </h1>
                            <p className="text-[11px] text-slate-500 mt-1 font-medium">
                                Hello, <span className="text-indigo-400 font-bold">{username}</span> — here's how your store is performing
                            </p>
                        </div>
                    </div>
                    <PeriodDropdown value={period} onChange={setPeriod} />
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
                                <span className="text-[8px] font-black text-indigo-500/60 uppercase tracking-widest px-2 py-0.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10">After 5% fee</span>
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Net Profit</p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={net}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="text-2xl font-black text-white mt-1"
                                >
                                    {fmt(net)}
                                </motion.p>
                            </AnimatePresence>
                            <p className="text-[9px] text-slate-600 mt-1">Gross {fmt(gross)} · Fee {fmt(fee)}</p>
                        </div>
                    </motion.div>

                    <StatCard label="Gross Revenue" value={fmt(gross)} sub={`Before platform fee`} icon={<TrendingUp size={14} />} color="text-emerald-400" delay={0.1} />
                    <StatCard label="Total Products" value={MOCK_PRODUCT_COUNT} sub="active listings" icon={<Package size={14} />} color="text-blue-400" delay={0.15} />
                    <StatCard label="Conversion Rate" value="68%" sub="bids → completed sales" icon={<Target size={14} />} color="text-purple-400" delay={0.2} />
                </div>

                {/* ── Main Charts Grid ── */}
                <div className="grid grid-cols-12 gap-6">

                    {/* Bar Chart — left 8 cols */}
                    <div className="col-span-12 xl:col-span-8 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 space-y-5">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h3 className="text-sm font-black text-white flex items-center gap-2">
                                    <BarChart3 size={16} className="text-indigo-400" />
                                    {chartTab === 'revenue' ? 'Revenue Overview' : 'Bid Activity'}
                                </h3>
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                                    {PERIODS.find(p => p.key === period)?.label}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Tabs */}
                                <div className="flex bg-black/30 border border-white/5 rounded-xl p-1">
                                    {[{ key: 'revenue', label: 'Revenue' }, { key: 'bids', label: 'Bids' }].map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => setChartTab(t.key)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartTab === t.key ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                                <PeriodDropdown value={period} onChange={setPeriod} />
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
                                    color={barColor}
                                    isCurrency={isCurrency}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Bids note */}
                        {chartTab === 'bids' && (
                            <p className="text-[9px] text-slate-700 font-bold italic">
                                {/* TODO: Replace with real API — GET /api/seller/bids/count?period={period} */}
                                * Bid data shown is representative. Real-time data coming soon.
                            </p>
                        )}
                    </div>

                    {/* Donut Chart — right 4 cols */}
                    <div className="col-span-12 xl:col-span-4 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                <PieChart size={15} className="text-amber-400" /> Category Breakdown
                            </h3>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Revenue distribution</p>
                        </div>

                        <div className="flex justify-center py-2">
                            <DonutChart segments={CATEGORY_SEGMENTS} size={170} strokeWidth={28} />
                        </div>

                        {/* Legend */}
                        <div className="space-y-2 mt-2">
                            {CATEGORY_SEGMENTS.map((seg, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors truncate">{seg.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white ml-2">{seg.percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Bottom Row: Top Products + Category Bars ── */}
                <div className="grid grid-cols-12 gap-6">

                    {/* Top Products */}
                    <div className="col-span-12 xl:col-span-7 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 space-y-5">
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                            <Activity size={15} className="text-blue-400" /> Top Performing Products
                        </h3>
                        <div className="space-y-3">
                            {TOP_PRODUCTS.map((p, i) => {
                                const colors = ['#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6'];
                                const c = colors[i] || '#6366f1';
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="flex items-center gap-4 group"
                                    >
                                        <span className="text-[10px] font-black text-slate-600 w-6 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-[11px] font-black text-white truncate">{p.name}</p>
                                                <p className="text-[10px] font-black ml-4 flex-shrink-0" style={{ color: c }}>{fmt(p.revenue)}</p>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${p.pct}%` }}
                                                    transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
                                                    className="h-full rounded-full"
                                                    style={{ background: `linear-gradient(to right, ${c}aa, ${c})` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-600 w-8 text-right">{p.pct}%</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category success bars */}
                    <div className="col-span-12 xl:col-span-5 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 space-y-5">
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                            <ArrowUpRight size={15} className="text-emerald-400" /> Category Performance
                        </h3>
                        <div className="space-y-4">
                            {CATEGORY_SEGMENTS.map((seg, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400">{seg.name}</span>
                                        <span className="text-[10px] font-black text-white">{seg.percent}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${seg.percent}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(to right, ${seg.color}88, ${seg.light})` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── New Seller Market Trends (shown if < 5 products) ── */}
                {isNewSeller && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-indigo-950/60 via-purple-950/20 to-transparent border border-indigo-500/20 rounded-[2rem] p-6 space-y-6"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/20">
                                    <Zap size={16} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                                        📈 Market Trends for New Sellers
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        Based on BidStream auction data · India · 2025-2026
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/15 rounded-xl">
                                <Zap size={10} className="text-indigo-400" />
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">AI · Updated Daily</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                            You have <span className="text-white font-bold">{MOCK_PRODUCT_COUNT} products</span> listed. Here are the hottest auction categories right now — choose where to list next for maximum bidder interest.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                            {MARKET_TRENDS.map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.08 }}
                                    className="bg-white/[0.03] border border-white/[0.06] hover:border-white/10 rounded-2xl p-4 space-y-2 group cursor-pointer transition-all hover:bg-white/[0.05]"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-600">{t.rank}</span>
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{ color: t.color, backgroundColor: `${t.color}15` }}>{t.growth}</span>
                                    </div>
                                    <p className="text-base">{t.emoji}</p>
                                    <p className="text-[11px] font-black text-white leading-tight">{t.name}</p>
                                    <p className="text-[9px] text-slate-500 leading-relaxed">{t.insight}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-5 space-y-3 hover:border-white/10 transition-all group"
    >
        <div className="flex items-center justify-between">
            <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                {icon}
            </div>
        </div>
        <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
            <p className="text-[9px] text-slate-600 font-medium mt-0.5">{sub}</p>
        </div>
    </motion.div>
);

export default AnalyticsPage;
