import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, LogOut, Settings, Package, ChevronDown, Heart, HelpCircle, User, Store } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { BidStreamLogo } from '../ui/Logo';
import { useAuthStore, getProfileColor } from '../../stores';
import { toast } from 'react-hot-toast';

const DashboardNavbar = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const switchRole = useAuthStore((state) => state.switchRole);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedCat, setSelectedCat] = useState("All Categories");
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchToSeller = async () => {
        console.log('handleSwitchToSeller triggered');
        try {
            const loadingToast = toast.loading('Switching to Seller view...');
            await switchRole('ROLE_SELLER');
            toast.success('Switched to Seller mode', { id: loadingToast });
            navigate('/seller');
        } catch (error) {
            console.error('Role switch error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to switch roles';
            toast.error(errorMessage);
        }
    };

    // Profile Logic: Extracts 'P' for 'palash2105'
    const username = user?.email?.split('@')[0] || "palash2105";
    const avatarColor = getProfileColor(username);
    const initial = username.charAt(0).toUpperCase();

    return (
        <nav
            className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-[60] transition-colors duration-300">
            {/* Top Utility Bar (eBay Aesthetic) */}
            <div className="border-b border-slate-100 dark:border-slate-800 hidden sm:block">
                <div
                    className="mx-auto max-w-[1400px] px-6 py-2 flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <div className="flex gap-8">
                        <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer"><HelpCircle
                            size={12} /> Help & Support</span>
                        <span className="hover:text-blue-600 cursor-pointer">Daily Deals</span>
                        <span className="hover:text-blue-600 cursor-pointer">Brand Outlet</span>
                    </div>
                    <div className="flex gap-8">
                        <span
                            onClick={handleSwitchToSeller}
                            className="hover:text-blue-600 cursor-pointer text-[10px] font-black border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-md"
                        >
                            Sell
                        </span>
                        <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1.5"><Heart
                            size={12} /> Wishlist</span>
                    </div>
                </div>
            </div>

            {/* Main Navbar Section */}
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 gap-8">
                <Link to="/"><BidStreamLogo /></Link>

                {/* Integrated Search Container with Category Dropdown */}
                <div
                    className="flex-1 hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all overflow-hidden group">
                    <div className="pl-4 border-r border-slate-200 dark:border-slate-700 pr-2">
                        <select
                            value={selectedCat}
                            onChange={(e) => setSelectedCat(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-500 dark:text-slate-400"
                        >
                            <option>All Categories</option>
                            <option>Luxury Cars</option>
                            <option>Timepieces</option>
                            <option>Electronics</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder={`Search in ${selectedCat}...`}
                        className="flex-1 bg-transparent border-none outline-none px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                    />
                    <button
                        className="bg-blue-600 text-white px-8 py-2.5 hover:bg-blue-700 transition-colors cursor-pointer">
                        <Search size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        className="text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-all cursor-pointer relative">
                        <Bell size={22} />
                        {user && <span
                            className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />}
                    </button>

                    {!user ? (
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/login')}
                                className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-blue-600 cursor-pointer">Sign
                                In
                            </button>
                            <button onClick={() => navigate('/register')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black shadow-lg">Register
                            </button>
                        </div>
                    ) : (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 cursor-pointer group">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black border-2 border-white dark:border-slate-800 shadow-md transition-all group-active:scale-90"
                                    style={{ backgroundColor: avatarColor }}
                                >
                                    {initial}
                                </div>
                                <ChevronDown size={14}
                                    className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden transition-colors">
                                        <div className="p-5 border-b border-slate-50 dark:border-slate-800 mb-2">
                                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1 italic">Account
                                                Center</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <NavMenuItem icon={<User size={18} />} label="My Profile" />
                                            <NavMenuItem icon={<Package size={18} />} label="My Orders" />
                                            <NavMenuItem
                                                icon={<Store size={18} />}
                                                label="Sell Products"
                                                onClick={handleSwitchToSeller}
                                            />
                                            <NavMenuItem icon={<Settings size={18} />} label="My Settings" />
                                            <NavMenuItem icon={<HelpCircle size={18} />} label="Help & Support" />
                                        </div>
                                        <button onClick={logout}
                                            className="w-full text-left p-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all flex items-center gap-3 mt-4">
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavMenuItem = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer group">
        <span className="group-hover:text-blue-600 transition-colors">{icon}</span>
        <span>{label}</span>
    </button>
);

export default DashboardNavbar;