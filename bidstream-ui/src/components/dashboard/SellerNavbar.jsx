import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Search, Bell, PlusCircle, Wallet, Moon, Sun, ChevronDown,
    BarChart3, Package, LogOut, Settings, HelpCircle, User,
    Gavel, TrendingUp, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores';
import { toast } from 'react-hot-toast';

const SellerNavbar = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const switchRole = useAuthStore((state) => state.switchRole);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchToBidder = async () => {
        const loadingToast = toast.loading('Switching to Bidder view...');
        try {
            await switchRole('ROLE_BIDDER');
            toast.success('Switched to Bidder mode', { id: loadingToast });
            navigate('/bidder');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to switch roles';
            toast.error(errorMessage, { id: loadingToast });
        }
    };

    const handleListProduct = () => {
        if (!user?.isVerifiedSeller) {
            toast.error('Seller verification required. Please verify your profile first.', {
                icon: '🔒',
                duration: 4000,
            });
            navigate('/seller/verify');
        } else {
            navigate('/product/add');
        }
    };

    const username = user?.email?.split('@')[0] || "palash2105";
    const initial = username.charAt(0).toUpperCase();

    return (
        <nav className="w-full border-b border-white/15 bg-slate-950 sticky top-0 z-[60] backdrop-blur-xl bg-slate-950/80">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-4 gap-12">
                {/* Logo Section */}
                <div className="flex items-center gap-12">
                    <Link to="/seller" className="text-2xl font-black italic tracking-tighter text-white">
                        Bid<span className="text-indigo-500">Stream</span>
                        <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded-md not-italic tracking-widest font-bold border border-indigo-500/20 uppercase">Seller</span>
                    </Link>

                    {/* Navigation Items (Amazon Style - Moved from sidebar) */}
                    <div className="hidden lg:flex items-center gap-8">
                        <NavLink to="/seller" icon={<BarChart3 size={16} />} label="Dashboard" />
                        <NavLink to="/products" icon={<Package size={16} />} label="Products" />
                        <NavLink to="/analytics" icon={<TrendingUp size={16} />} label="Analytics" />
                        <NavLink to="/orders" icon={<ShoppingBag size={16} />} label="Orders" />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl hidden md:flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-all overflow-hidden group">
                    <div className="px-4 text-slate-500 group-focus-within:text-indigo-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search inventory, orders, or analytics..."
                        className="flex-1 bg-transparent px-2 py-3 outline-none text-sm font-medium text-white placeholder:text-slate-500"
                    />
                    <div className="p-1 px-2 pr-3 flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-1 rounded-md">CMD + K</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Action Buttons */}
                    <button
                        onClick={handleListProduct}
                        className="hidden xl:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <PlusCircle size={16} /> Add Product
                    </button>

                    <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl">
                        <NavIconBtn icon={<Bell size={20} />} hasUpdate />
                        <NavIconBtn icon={<Wallet size={20} />} />
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                                {initial}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Store Manager</p>
                                <p className="text-xs font-black text-white truncate max-w-[80px]">{username}</p>
                            </div>
                            <ChevronDown size={14} className={`text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-72 bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-3 z-[70] overflow-hidden"
                                >
                                    <div className="p-5 border-b border-white/5 mb-2">
                                        <p className="text-[10px] text-indigo-400 font-black uppercase mb-1 tracking-widest italic flex items-center gap-2">
                                            <TrendingUp size={10} /> Verified Seller
                                        </p>
                                        <p className="text-sm font-black text-white truncate">{user.email}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <NavMenuItem icon={<User size={18} />} label="My Store Profile" />
                                        <NavMenuItem
                                            icon={<Gavel size={18} className="text-indigo-400" />}
                                            label="Bid Products"
                                            subLabel="Switch to Bidder mode"
                                            onClick={handleSwitchToBidder}
                                            highlight
                                        />
                                        <div className="h-px bg-white/5 mx-2 my-2" />
                                        <NavMenuItem icon={<Settings size={18} />} label="Store Settings" />
                                        <NavMenuItem icon={<HelpCircle size={18} />} label="Help & Support" />
                                    </div>

                                    <button
                                        onClick={logout}
                                        className="w-full text-left p-4 text-sm font-black text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all flex items-center gap-3 mt-4 group"
                                    >
                                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Logout Session
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// UI Atoms
const NavLink = ({ to, icon, label }) => {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all group ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            {icon}
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
        </Link>
    );
};

const NavIconBtn = ({ icon, hasUpdate }) => (
    <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all relative group active:scale-90">
        {icon}
        {hasUpdate && <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950" />}
    </button>
);

const NavMenuItem = ({ icon, label, subLabel, onClick, highlight }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer group ${highlight ? 'bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10' : 'hover:bg-white/5'}`}
    >
        <div className="flex items-center gap-4">
            <span className={`transition-colors ${highlight ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`}>
                {icon}
            </span>
            <div className="text-left">
                <p className={`text-sm font-black ${highlight ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{label}</p>
                {subLabel && <p className="text-[10px] font-bold text-slate-500">{subLabel}</p>}
            </div>
        </div>
        {highlight && <ChevronDown size={14} className="text-indigo-500 -rotate-90" />}
    </button>
);

export default SellerNavbar;