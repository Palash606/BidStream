import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Heart, Zap, Clock, TrendingUp, Filter, Search, Sparkles, Flame, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroCarousel from './HeroCarousel';
import BidBuddy from './BidBuddy';
import LiveTimer from './LiveTimer';
import { productAPI } from '../../api/product';
import { categoryAPI } from '../../api/category';
import { toast } from 'react-hot-toast';

const BidderDashboard = () => {
    const navigate = useNavigate();
    const [isBotOpen, setIsBotOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [discovery, setDiscovery] = useState({ recommended: [], endingSoon: [], live: [] });
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [watchlist, setWatchlist] = useState([]);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [discoveryData, categoriesData] = await Promise.all([
                    productAPI.getDiscoveryData(),
                    categoryAPI.getCategories()
                ]);
                setDiscovery(discoveryData);
                setCategories([{ id: 'all', name: 'All' }, ...categoriesData]);
            } catch (error) {
                console.error("Discovery error:", error);
                toast.error("Failed to load marketplace data");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // 300ms Debounce for live search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Request-cancellable search with AbortController
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.trim().length < 2) {
            setSearchResults(null);
            setIsSearching(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsSearching(true);
        productAPI.search(debouncedQuery.trim(), null, controller.signal)
            .then(results => {
                if (results !== null) {
                    setSearchResults(results);
                }
            })
            .catch(error => {
                if (error.name !== 'CanceledError') {
                    console.error("Search error:", error);
                }
            })
            .finally(() => {
                setIsSearching(false);
            });

        return () => {
            controller.abort();
        };
    }, [debouncedQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleNavigate = (productId) => {
        navigate(`/product/${productId}`);
    };

    const toggleWatchlist = (e, productId) => {
        e.stopPropagation();
        setWatchlist(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId) 
                : [...prev, productId]
        );
        const isActive = !watchlist.includes(productId);
        toast.success(isActive ? 'Added to Watchlist' : 'Removed from Watchlist', {
            icon: isActive ? '❤️' : '💔',
            style: { borderRadius: '1rem', background: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
        });
    };

    return (
        <div className="space-y-12 pb-20">
            {/* 1. Search & Filter Bar */}
            <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by name, brand, or category..."
                            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-4 pl-16 pr-8 text-sm font-bold focus:outline-none focus:border-blue-500/50 transition-all dark:text-white"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {isSearching && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    activeCategory === cat.name
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50'
                                } cursor-pointer`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Search Results Layer */}
            <AnimatePresence>
                {searchResults && (
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">Search Results</h2>
                            <button onClick={() => {setSearchQuery(''); setSearchResults(null);}} className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase">Clear</button>
                        </div>
                        {searchResults.length === 0 ? (
                            <div className="py-20 text-center">
                                <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-400 font-bold">No items found matching "{searchQuery}"</p>
                                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Try a different keyword or browse categories</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {searchResults.map(lot => (
                                    <AuctionLotCard 
                                        key={lot.id} 
                                        lot={lot} 
                                        isWatched={watchlist.includes(lot.id)} 
                                        onWatch={(e) => toggleWatchlist(e, lot.id)} 
                                        onNavigate={handleNavigate}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* 3. Personalized Hero Section */}
            {!searchQuery && (
                <section className="relative">
                    <HeroCarousel onOpenBot={() => setIsBotOpen(true)} />
                </section>
            )}

            {/* 4. Personalized Discovery Sections */}
            {!searchQuery && (
                <div className="space-y-20">
                    {/* RECOMMENDED SECTION */}
                    <DiscoveryRow 
                        title="Recommended For You" 
                        subtitle="Curated based on your interests" 
                        icon={<Sparkles className="text-amber-500" size={20} />}
                        loading={loading}
                        lots={discovery.recommended}
                        watchlist={watchlist}
                        onWatch={toggleWatchlist}
                        onNavigate={handleNavigate}
                    />

                    {/* ENDING SOON SECTION */}
                    <DiscoveryRow 
                        title="Ending Soon" 
                        subtitle="Last call for these exclusive lots" 
                        icon={<Flame className="text-rose-500" size={20} />}
                        loading={loading}
                        lots={discovery.endingSoon}
                        watchlist={watchlist}
                        onWatch={toggleWatchlist}
                        onNavigate={handleNavigate}
                    />

                    {/* LIVE NOW SECTION */}
                    <DiscoveryRow 
                        title="Live Auctions" 
                        subtitle="Explore all active sessions right now" 
                        icon={<Zap className="text-blue-500" size={20} />}
                        loading={loading}
                        lots={discovery.live}
                        watchlist={watchlist}
                        onWatch={toggleWatchlist}
                        onNavigate={handleNavigate}
                    />
                </div>
            )}

            <BidBuddy isOpen={isBotOpen} setIsOpen={setIsBotOpen} />
        </div>
    );
};

// --- Child Components ---

const DiscoveryRow = ({ title, subtitle, icon, loading, lots, watchlist, onWatch, onNavigate }) => (
    <section>
        <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">{icon}</div>
                <div>
                    <h2 className="text-3xl font-black dark:text-white tracking-tighter italic uppercase">{title}</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{subtitle}</p>
                </div>
            </div>
            <button className="bg-slate-100 dark:bg-slate-900 text-slate-500 px-6 py-2 rounded-full font-black text-[10px] uppercase transition-all hover:bg-blue-600 hover:text-white group">
                View All <TrendingUp size={12} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
                Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : lots.length > 0 ? (
                lots.slice(0, 3).map(lot => (
                    <AuctionLotCard 
                        key={lot.id} 
                        lot={lot} 
                        isWatched={watchlist.includes(lot.id)} 
                        onWatch={onWatch} 
                        onNavigate={onNavigate}
                    />
                ))
            ) : (
                <div className="col-span-full py-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                    <p className="font-bold italic uppercase text-xs tracking-widest">No auctions available in this category yet</p>
                </div>
            )}
        </div>
    </section>
);

const AuctionLotCard = React.memo(({ lot, isWatched, onWatch, onNavigate }) => (
    <div 
        onClick={() => onNavigate && onNavigate(lot.id)}
        className="group cursor-pointer"
    >
        <div className="relative h-[24rem] rounded-[3rem] overflow-hidden mb-8 shadow-2xl border-4 border-white dark:border-slate-800 transition-all group-hover:-translate-y-2">
            <img 
                src={lot.imageUrls?.[0] || "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800"} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt={lot.name} 
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
            
            <div className="absolute top-6 left-6 flex gap-2">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Live</span>
                </div>
                {lot.category && (
                    <div className="bg-blue-600 px-4 py-2 rounded-full text-white text-[10px] font-black uppercase shadow-lg shadow-blue-600/40">
                        {lot.category.name}
                    </div>
                )}
            </div>

            <button 
                onClick={(e) => onWatch(e, lot.id)}
                className={`absolute top-6 right-6 p-4 rounded-full backdrop-blur-md transition-all ${
                    isWatched ? 'bg-rose-500 text-white shadow-rose-500/50' : 'bg-white/20 text-white hover:bg-white/40'
                } border border-white/20`}
            >
                <Heart size={20} fill={isWatched ? "currentColor" : "none"} />
            </button>

            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate(lot.id);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-black text-xs shadow-2xl transition-colors"
                >
                    BID NOW
                </div>
            </div>
        </div>

        <div className="px-4">
            <h3 className="text-2xl font-black mb-4 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tighter italic truncate">{lot.name}</h3>
            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-6 rounded-[2.5rem] border border-transparent dark:border-slate-800">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Price Guide</p>
                    <p className="text-xl font-black dark:text-white">₹{lot.initialPrice?.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-red-500 uppercase mb-1 flex items-center gap-1 justify-end">
                        <Clock size={10} /> Ends In</p>
                    <LiveTimer initialSeconds={Math.max(0, (new Date(lot.auctionEndTime) - new Date()) / 1000)} />
                </div>
            </div>
        </div>
    </div>
));

const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="h-[24rem] bg-slate-200 dark:bg-slate-800 rounded-[3rem] mb-8" />
        <div className="px-4 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3" />
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]" />
        </div>
    </div>
);

export default BidderDashboard;
