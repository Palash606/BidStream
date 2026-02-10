import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {
    BarChart3,
    Package,
    TrendingUp,
    DollarSign,
    Clock,
    AlertCircle,
    Plus,
    LayoutGrid,
    Archive,
    Wallet,
    ListChecks,
    MessageSquareText
} from 'lucide-react';
import BidBuddy from './BidBuddy';

const SellerDashboard = () => {
    const [isBotOpen, setIsBotOpen] = useState(false);
    const [viewMode, setViewMode] = useState('bar');

    return (
        <div className="space-y-8 pb-24 transition-colors duration-500">
            {/* 1. Operational Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-5xl font-black dark:text-white tracking-tighter uppercase italic">Seller
                        Command</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Global Auction
                        Fulfillment Center</p>
                </div>
                <button
                    className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs shadow-xl shadow-indigo-600/20 flex items-center gap-3 hover:scale-105 transition-all cursor-pointer">
                    <Plus size={20}/> LIST NEW PRODUCT
                </button>
            </header>

            {/* 2. Bento Grid Stats (Feature 3 & 6) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SellerStat icon={<DollarSign/>} label="Net Earnings" value="₹42.5L" sub="↑ 14% vs last month"
                            color="bg-emerald-500"/>
                <SellerStat icon={<TrendingUp/>} label="Live Bids" value="184" sub="Across 12 active lots"
                            color="bg-indigo-600"/>
                <SellerStat icon={<Wallet/>} label="Pending Payouts" value="₹8.12L" sub="3 items awaiting ship"
                            color="bg-blue-600"/>
                <SellerStat icon={<AlertCircle/>} label="Archived/Unsold" value="02" sub="Requires review"
                            color="bg-rose-500"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Performance Monitor (Feature 2 & 3) */}
                <div
                    className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 dark:text-white">
                            <BarChart3 size={20} className="text-indigo-600"/> Revenue Analytics
                        </h3>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button onClick={() => setViewMode('bar')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'bar' ? 'bg-white dark:bg-slate-700 dark:text-white shadow-sm' : 'text-slate-400'}`}>Bar
                            </button>
                            <button onClick={() => setViewMode('line')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'line' ? 'bg-white dark:bg-slate-700 dark:text-white shadow-sm' : 'text-slate-400'}`}>Line
                            </button>
                        </div>
                    </div>
                    <div
                        className="h-64 flex items-end gap-3 px-2 border-b border-slate-100 dark:border-slate-800 pb-4 relative">
                        {/* Interactive Data Visualization */}
                        {[40, 70, 55, 95, 65, 85, 45, 90, 75, 50, 80, 60].map((h, i) => (
                            <motion.div key={i} initial={{height: 0}} animate={{height: `${h}%`}}
                                        className="flex-1 bg-indigo-600/20 hover:bg-indigo-600 rounded-t-xl transition-all cursor-pointer group">
                                <div
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">₹{h * 10}k
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div
                        className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                        <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
                    </div>
                </div>

                {/* 4. Automated Alerts Feed (Feature 8) */}
                <div
                    className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-black uppercase tracking-widest text-sm mb-8 dark:text-white flex items-center justify-between">
                        Live Alerts <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"/>
                    </h3>
                    <div className="space-y-6">
                        <AlertRow type="bid" msg="New bid of ₹45,000 on Rolex Daytona" time="2m ago"/>
                        <AlertRow type="sold" msg="iPhone Prototype SOLD for ₹1.2L" time="1h ago"/>
                        <AlertRow type="fulfillment" msg="Pending: Print shipping label for Item #82" time="4h ago"/>
                    </div>
                </div>
            </div>

            {/* 5. Inventory Matrix (Feature 4 & 5) */}
            <section
                className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white">Active
                        Inventory</h2>
                    <div className="flex gap-8">
                        <button
                            className="text-[11px] font-black uppercase text-indigo-600 border-b-2 border-indigo-600 pb-1">All
                            Items
                        </button>
                        <button className="text-[11px] font-black uppercase text-slate-400">Drafts</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InventoryItem title="2024 Rolex Daytona" status="Active" bids="42" price="₹28,50,000"/>
                    <InventoryItem title="Apple Vision Pro 'Internal'" status="Sold" bids="12" price="₹4,12,000"/>
                </div>
            </section>

            <BidBuddy isOpen={isBotOpen} setIsOpen={setIsBotOpen}/>
        </div>
    );
};

// UI Atoms
const SellerStat = ({icon, label, value, sub, trend, color}) => (
    <div
        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div
            className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/5`}>{icon}</div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mb-2">{label}</p>
        <p className="text-3xl font-black dark:text-white">{value}</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px] mt-2 uppercase tracking-tighter italic">{sub}</p>
    </div>
);

const InventoryItem = ({title, status, bids, price}) => (
    <div
        className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group hover:border-indigo-600 transition-all cursor-pointer">
        <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl"/>
            <div>
                <h4 className="font-black text-lg uppercase dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bids} Bids • Ending in
                    4h</p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-black text-xl dark:text-white mb-2">{price}</p>
            <span
                className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full ${status === 'Active' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>{status}</span>
        </div>
    </div>
);

const AlertRow = ({msg, time}) => (
    <div className="flex gap-4 items-start p-2 group cursor-pointer">
        <div
            className="w-1.5 h-10 bg-indigo-100 dark:bg-slate-800 group-hover:bg-indigo-600 rounded-full transition-colors"/>
        <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight">{msg}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{time}</p>
        </div>
    </div>
);

export default SellerDashboard;