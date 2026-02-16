import React, { useState } from 'react';
import { Gavel, Heart, Zap, Clock, TrendingUp, Filter, Search } from 'lucide-react';
import HeroCarousel from './HeroCarousel';
import BidBuddy from './BidBuddy';
import LiveTimer from './LiveTimer';

const BidderDashboard = () => {
    const [isBotOpen, setIsBotOpen] = useState(false);

    return (
        <div className="space-y-12 pb-20">
            {/* 1. Personalized Hero Section */}
            <section className="relative">
                <HeroCarousel onOpenBot={() => setIsBotOpen(true)} />
            </section>

            {/* 2. Status Bento Grid: Instant Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard
                    icon={<Gavel className="text-blue-600" />}
                    label="My Active Bids"
                    value="12"
                    sub="Winning 8 • Outbid 4"
                />
                <StatusCard
                    icon={<Heart className="text-rose-500" />}
                    label="Watchlist"
                    value="24"
                    sub="3 items ending in < 1h"
                />
                <StatusCard
                    icon={<Zap className="text-amber-500" />}
                    label="Won Items"
                    value="₹12,40,000"
                    sub="Awaiting Payment for 2"
                />
            </div>

            {/* 3. Live Now: The Discovery Engine */}
            <section>
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-4xl font-black dark:text-white tracking-tighter italic uppercase">Live
                            Auctions</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Curated
                            based on your interests</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-blue-600 transition-all cursor-pointer">
                            <Filter size={20} /></button>
                        <button
                            className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs shadow-lg shadow-blue-600/20 hover:scale-105 transition-all cursor-pointer">VIEW
                            ALL LOTS
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AuctionLotCard
                        title="Patek Philippe Nautilus"
                        img="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800"
                        price="₹62,50,000"
                        bids="84"
                        time={3600}
                    />
                    <AuctionLotCard
                        title="1963 Corvette Sting Ray"
                        img="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"
                        price="₹1,15,00,000"
                        bids="12"
                        time={120}
                    />
                    <AuctionLotCard
                        title="Rare Pokémon Charizard"
                        img="https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=800"
                        price="₹8,50,000"
                        bids="246"
                        time={72000}
                    />
                </div>
            </section>

            <BidBuddy isOpen={isBotOpen} setIsOpen={setIsBotOpen} />
        </div>
    );
};

// UI Atoms for Bidder Dashboard
const StatusCard = ({ icon, label, value, sub }) => (
    <div
        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl group">
        <div
            className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black dark:text-white">{value}</p>
        <p className="text-blue-600 font-bold text-[10px] mt-2 uppercase tracking-tighter italic">{sub}</p>
    </div>
);

const AuctionLotCard = ({ title, img, price, bids, time }) => (
    <div className="group cursor-pointer">
        <div
            className="relative h-80 rounded-[3rem] overflow-hidden mb-8 shadow-2xl border-4 border-white dark:border-slate-800 transition-all group-hover:-translate-y-2">
            <img src={img}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt={title} />
            <div
                className="absolute top-6 left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Live</span>
            </div>
            <div
                className="absolute bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                <TrendingUp size={24} />
            </div>
        </div>
        <div className="px-4">
            <h3 className="text-2xl font-black mb-4 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tighter italic truncate">{title}</h3>
            <div
                className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-6 rounded-[2.5rem] border border-transparent dark:border-slate-800">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Bid</p>
                    <p className="text-xl font-black dark:text-white">{price}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-red-500 uppercase mb-1 flex items-center gap-1 justify-end">
                        <Clock size={10} /> Ends In</p>
                    <LiveTimer initialSeconds={time} />
                </div>
            </div>
        </div>
    </div>
);

export default BidderDashboard;