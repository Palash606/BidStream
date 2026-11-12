import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Search, Bell, PlusCircle, Wallet, ChevronDown,
    BarChart3, Package, LogOut, Settings, HelpCircle, User,
    Gavel, TrendingUp, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores';
import { toast } from 'react-hot-toast';
import ThemeToggle from '../common/ThemeToggle';

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
        <nav className="w-full border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 sticky top-0 z-[60] backdrop-blur-xl transition-colors duration-300">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 sm:px-8 py-3.5 gap-6 sm:gap-12">
                {/* Top-Left Section: Theme Toggle & Logo */}
                <div className="flex items-center gap-4 sm:gap-8">
                    {/* Top-Left Theme Switcher */}
                    <ThemeToggle variant="switch" />

                    <Link to="/seller" className="text-xl sm:text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Bid<span className="text-indigo-600 dark:text-indigo-400">Stream</span></span>
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] rounded-md not-italic tracking-widest font-bold border border-indigo-500/20 uppercase">
                            Seller
                        </span>
                    </Link>

                    {/* Navigation Items (Amazon Style) */}
                    <div className="hidden lg:flex items-center gap-6">
                        <NavLink to="/seller" icon={<BarChart3 size={16} />} label="Dashboard" />
                        <NavLink to="/products" icon={<Package size={16} />} label="Products" />
                        <NavLink to="/analytics" icon={<TrendingUp size={16} />} label="Analytics" />
                        <NavLink to="/orders" icon={<ShoppingBag size={16} />} label="Orders" />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl hidden md:flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 focus-within:border-indigo-500/50 transition-all overflow-hidden group">
                    <div className="px-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search inventory, orders, or analytics..."
                        className="flex-1 bg-transparent px-2 py-2.5 outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <div className="p-1 px-2 pr-3 flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-md">CMD + K</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    {/* Action Buttons */}
                    <button
                        onClick={handleListProduct}
                        className="hidden xl:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
                    >
                        <PlusCircle size={16} /> Add Product
                    </button>

                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                        <NavIconBtn icon={<Bell size={18} />} hasUpdate />
                        <NavIconBtn icon={<Wallet size={18} />} />
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-all group active:scale-95 cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                                {initial}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Store Manager</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[80px]">{username}</p>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-3 z-[70] overflow-hidden"
                                >
                                    <div className="p-5 border-b border-slate-100 dark:border-white/5 mb-2">
                                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase mb-1 tracking-widest italic flex items-center gap-2">
                                            <TrendingUp size={10} /> Verified Seller
                                        </p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.email}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <NavMenuItem icon={<User size={18} />} label="My Store Profile" />
                                        <NavMenuItem
                                            icon={<Gavel size={18} className="text-indigo-600 dark:text-indigo-400" />}
                                            label="Bid Products"
                                            subLabel="Switch to Bidder mode"
                                            onClick={handleSwitchToBidder}
                                            highlight
                                        />
                                        <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-2" />
                                        <NavMenuItem icon={<Settings size={18} />} label="Store Settings" />
                                        <NavMenuItem icon={<HelpCircle size={18} />} label="Help & Support" />
                                    </div>

                                    <button
                                        onClick={logout}
                                        className="w-full text-left p-4 text-sm font-black text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all flex items-center gap-3 mt-4 group cursor-pointer"
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
        <Link to={to} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all group ${active ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
            {icon}
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
        </Link>
    );
};

const NavIconBtn = ({ icon, hasUpdate }) => (
    <button className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all relative group active:scale-90 cursor-pointer">
        {icon}
        {hasUpdate && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-950" />}
    </button>
);

const NavMenuItem = ({ icon, label, subLabel, onClick, highlight }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer group ${highlight ? 'bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
    >
        <div className="flex items-center gap-4">
            <span className={`transition-colors ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                {icon}
            </span>
            <div className="text-left">
                <p className={`text-sm font-black ${highlight ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{label}</p>
                {subLabel && <p className="text-[10px] font-bold text-slate-500">{subLabel}</p>}
            </div>
        </div>
        {highlight && <ChevronDown size={14} className="text-indigo-500 -rotate-90" />}
    </button>
);

export default SellerNavbar;
