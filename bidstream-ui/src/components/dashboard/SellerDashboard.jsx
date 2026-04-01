import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, Package, TrendingUp, DollarSign, Clock,
    AlertCircle, Plus, LayoutGrid, Archive, Wallet,
    ListChecks, MessageSquareText, Gavel, Users,
    ArrowUpRight, ArrowDownRight, Zap, HelpCircle,
    Info, ExternalLink, ShieldCheck, ArrowRight,
    PieChart, Activity, ShoppingCart, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import BidBuddy from './BidBuddy';

const SellerDashboard = () => {
    const user = useAuthStore((state) => state.user);
    const checkVerificationStatus = useAuthStore((state) => state.checkVerificationStatus);
    const navigate = useNavigate();
    const [isBotOpen, setIsBotOpen] = useState(false);
    const [timeRange, setTimeRange] = useState('7D');

    // Mock Data for Analytics
    const performanceData = [
        { day: 'Mon', sales: 42000, bids: 120 },
        { day: 'Tue', sales: 58000, bids: 154 },
        { day: 'Wed', sales: 35000, bids: 89 },
        { day: 'Thu', sales: 72000, bids: 210 },
        { day: 'Fri', sales: 91000, bids: 245 },
        { day: 'Sat', sales: 88000, bids: 230 },
        { day: 'Sun', sales: 110000, bids: 310 }
    ];

    const categoryData = [
        { name: 'Luxury Watches', percentage: 45, color: 'bg-indigo-500' },
        { name: 'Rare Collectibles', percentage: 30, color: 'bg-blue-400' },
        { name: 'Electronics', percentage: 15, color: 'bg-emerald-400' },
        { name: 'Other', percentage: 10, color: 'bg-slate-600' }
    ];

    const priceTiers = [
        { tier: '< ₹10k', count: 12, growth: '+5%' },
        { tier: '₹10k - ₹50k', count: 24, growth: '+12%' },
        { tier: '₹50k - ₹2L', count: 8, growth: '+18%' },
        { tier: '> ₹2L', count: 15, growth: '+22%' }
    ];

    useEffect(() => {
        if (user?.email) {
            checkVerificationStatus();
        }
    }, [user?.email, checkVerificationStatus]);



    return (
        <div className="min-h-screen bg-[#050510] text-[#a0a0c0] pb-12 font-sans selection:bg-indigo-500/30">
            <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">

                {/* Top Action Bar (Amazon Style Density) */}
                <div className="flex justify-between items-center bg-white/[0.03] border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Cluster: Asia-South</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400">
                            <Activity size={12} /> Live Market Pulse: ACTIVE
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                            {['7D', '1M', '1Y'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded-md text-[9px] font-black transition-all ${timeRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <div className="flex bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl items-center gap-3 group cursor-pointer hover:bg-indigo-500/15 transition-all">
                            <Zap size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-indigo-300 tracking-widest leading-none">Market Spotlight</span>
                                <span className="text-[10px] font-bold text-white leading-tight">Trending: Luxury Timepieces</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-12 gap-6">

                    {/* Left Column: Stats & Primary Charts (8/12) */}
                    <div className="col-span-12 xl:col-span-8 space-y-6">

                        {/* High-Density Stat Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <CompactStat label="Total Revenue" value="₹4.2M" change="+12.4%" trend="up" icon={<DollarSign size={14} />} />
                            <CompactStat label="Avg. Order Value" value="₹85k" change="+3.2%" trend="up" icon={<Activity size={14} />} />
                            <CompactStat label="Sell-Through Rate" value="78%" change="-1.5%" trend="down" icon={<Package size={14} />} />
                            <CompactStat label="Storage Health" value="92%" change="Optimal" trend="neutral" icon={<Archive size={14} />} />
                        </div>

                        {/* Revenue Velocity Chart (Gorgeously Detailed) */}
                        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-[2rem] space-y-6 shadow-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider italic flex items-center gap-2">
                                        <TrendingUp size={16} className="text-indigo-400" /> Revenue Velocity
                                    </h3>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Growth trends vs Industry Average</p>
                                </div>
                                <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-500">
                                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Volume</div>
                                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Bids</div>
                                </div>
                            </div>

                            <div className="h-64 flex items-end gap-2 px-2 border-b border-white/5 pb-4">
                                {performanceData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col gap-1 items-center group cursor-pointer relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap">
                                            ₹{(d.sales / 1000).toFixed(1)}k • {d.bids} Bids
                                        </div>
                                        {/* Bid Bar (bg) */}
                                        <div className="w-full bg-blue-400/10 rounded-t-lg absolute bottom-4 transition-all" style={{ height: `${(d.bids / 350) * 100}%` }} />
                                        {/* Sales Bar (fg) */}
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(d.sales / 120000) * 100}%` }}
                                            className="w-1/2 bg-gradient-to-t from-indigo-700 to-indigo-400 rounded-t-xl z-10 transition-all group-hover:scale-x-110"
                                        />
                                        <span className="text-[8px] font-black text-slate-500 group-hover:text-white mt-1 uppercase">{d.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Secondary Analytics: Tiers & Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-[2rem]">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <PieChart size={14} className="text-blue-400" /> Category Distribution
                                </h4>
                                <div className="space-y-4">
                                    {categoryData.map((c, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-tight">
                                                <span>{c.name}</span>
                                                <span className="text-white">{c.percentage}%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${c.percentage}%` }}
                                                    className={`h-full ${c.color}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-[2rem]">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <BarChart3 size={14} className="text-emerald-400" /> Price Tier Performance
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {priceTiers.map((p, i) => (
                                        <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                            <p className="text-[8px] font-bold text-slate-500 uppercase">{p.tier}</p>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-sm font-black text-white">{p.count}</span>
                                                <span className="text-[8px] font-black text-emerald-400">{p.growth}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Alerts, Onboarding & Support (4/12) */}
                    <div className="col-span-12 xl:col-span-4 space-y-6">

                        {/* New Seller Onboarding Showcase */}
                        <div className="bg-gradient-to-br from-indigo-900/40 via-blue-900/20 to-transparent border border-indigo-500/30 p-6 rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform text-white">
                                <Package size={150} />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-600/30">
                                        <Sparkles size={16} />
                                    </div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Inventory Showcase</h3>
                                </div>
                                <p className="text-[10px] font-medium leading-relaxed">Preview how your listings captivate high-intent bidders through our Neural Ranker.</p>

                                {/* Interactive Mini-Preview */}
                                <div className="bg-black/40 p-4 rounded-3xl border border-white/10 space-y-3">
                                    <div className="h-24 bg-slate-800 rounded-2xl overflow-hidden relative border border-white/10 group/item">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                                            <div>
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Example Lot</p>
                                                <p className="text-[10px] font-black text-white">Classic Chronograph</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-indigo-400">₹85,000</p>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500 text-[6px] font-black text-white rounded-full uppercase tracking-widest"
                                        >
                                            Live Bid
                                        </motion.div>
                                    </div>
                                    <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-xl text-[8px] font-black text-white uppercase transition-all">
                                        Launch Sample Product
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Alerts & Critical Checks */}
                        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-[2.5rem] space-y-6">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={14} className="text-rose-400" /> Compliance Alerts
                            </h4>
                            <div className="space-y-4">
                                {!user?.isVerifiedSeller && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-3 group cursor-pointer hover:bg-rose-500/20 transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Identity Lock</span>
                                            <ChevronDown size={14} className="text-rose-500 group-hover:rotate-180 transition-transform" />
                                        </div>
                                        <p className="text-[10px] font-medium leading-tight">Your verification is pending. Professional tools are currently gated.</p>
                                        <button
                                            onClick={() => navigate('/seller/verify')}
                                            className="w-full py-2 bg-rose-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20"
                                        >
                                            Verify Identity Now
                                        </button>
                                    </div>
                                )}
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                                    <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white uppercase">Vault Security</p>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">Active Protection Layer 4</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Help & Support (Bidder Style Refinement) */}
                        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] space-y-6 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg text-indigo-400">
                                    <HelpCircle size={16} />
                                </div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Stream Center</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[9px] font-bold group hover:text-white cursor-pointer transition-colors px-2">
                                    <span>Seller Academy</span>
                                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-all text-indigo-400" />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-bold group hover:text-white cursor-pointer transition-colors px-2">
                                    <span>Fee Structure</span>
                                    <Info size={10} className="opacity-0 group-hover:opacity-100 transition-all text-indigo-400" />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-bold group hover:text-white cursor-pointer transition-colors px-2">
                                    <span>24/7 Priority Support</span>
                                    <MessageSquareText size={10} className="opacity-0 group-hover:opacity-100 transition-all text-indigo-400" />
                                </div>
                                <a
                                    href="https://bidstream.com/terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between text-[9px] font-bold group hover:text-white cursor-pointer transition-colors px-2"
                                >
                                    <span>Terms & Conditions</span>
                                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-all text-indigo-400" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section: Matches Bidder Styles Cleanly */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-px bg-indigo-500/50 hidden md:block" />
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2026 BidStream Global Command • Built for High-Stakes Commerce</p>
                    </div>
                    <div className="flex gap-2">
                        {[Activity, Gavel, LayoutGrid, User].map((Icon, i) => (
                            <button key={i} className="p-2.5 bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/5 shadow-inner">
                                <Icon size={14} />
                            </button>
                        ))}
                    </div>
                </div>

            </div>
            <BidBuddy isOpen={isBotOpen} setIsOpen={setIsBotOpen} />
        </div>
    );
};

// Internal Components
const CompactStat = ({ label, value, change, trend, icon }) => (
    <div className="bg-white/[0.02] border border-white/10 p-5 rounded-[2rem] hover:border-white/20 transition-all group shadow-sm hover:shadow-indigo-500/5">
        <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                {icon}
            </div>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-500'
                }`}>
                {change}
            </span>
        </div>
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{label}</p>
        <p className="text-2xl font-black text-white tracking-tighter mt-1">{value}</p>
    </div>
);

const Sparkles = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

const ChevronDown = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default SellerDashboard;
