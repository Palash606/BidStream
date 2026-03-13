import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    Heart,
    User,
    ChevronDown,
    Bell,
    HelpCircle,
    LayoutDashboard,
    Settings,
    Mail,
    Shield,
    Store,
    LogOut
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../../stores';
import { toast } from 'react-hot-toast';

/**
 * PublicNavbar - Fully responsive desktop layout on all screen sizes
 * No mobile sidebar - same layout everywhere, just scaled proportionally
 */
const PublicNavbar = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const switchRole = useAuthStore((state) => state.switchRole);

    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchToSeller = async () => {
        console.log('PublicNavbar: handleSwitchToSeller triggered');
        try {
            const loadingToast = toast.loading('Switching to Seller view...');
            await switchRole('ROLE_SELLER');
            toast.success('Switched to Seller mode', { id: loadingToast });
            navigate('/seller');
        } catch (error) {
            console.error('Role switch error:', error);
            toast.error('Failed to switch roles');
        }
    };

    const categories = [
        'All Categories',
        'Luxury Cars',
        'Timepieces',
        'Fine Art',
        'Electronics',
        'Collectibles',
        'Fashion',
        'Real Estate',
        'Rare Books'
    ];

    const ribbonCategories = [
        'Saved',
        'Electronics',
        'Motors',
        'Fashion',
        'Collectibles & Art',
        'Sports',
        'Health & Beauty',
        'Home & Garden',
        'Jewelry',
        'Books',
        'Toys & Games',
        'Business & Industrial',
        'Antiques',
        'Music',
        'Phones & Accessories'
    ];

    // Login lock system - redirect to login if not authenticated
    const handleProtectedAction = (action) => {
        if (!user) {
            navigate('/login');
        } else {
            action();
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleProtectedAction(() => {
            if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`);
            }
        });
    };

    return (
        <nav className="sticky top-0 z-50 bg-[var(--nav-bg)] border-b border-[var(--border-default)] shadow-sm transition-colors duration-300">
            {/* Top Utility Bar */}
            <div className="bg-slate-950 border-b border-slate-800 transition-colors duration-300">
                <div className="max-w-[1400px] mx-auto px-6 py-2 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-6">
                        {!user ? (
                            <>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Hi! <Link to="/login"
                                        className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link> or <Link
                                            to="/register"
                                            className="text-blue-600 hover:text-blue-700 font-semibold">register</Link>
                                </span>
                            </>
                        ) : (
                            <span className="text-gray-600 dark:text-gray-400">
                                Hi, <span
                                    className="font-semibold text-gray-900 dark:text-white">{user.firstName || user.email?.split('@')[0]}</span>!
                            </span>
                        )}
                        <Link to="/deals"
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                            Daily Deals
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell - Moved from main navbar */}
                        <button
                            onClick={() => handleProtectedAction(() => navigate('/notifications'))}
                            className="relative p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell size={14} className="text-gray-600 dark:text-gray-400" />
                            {user && (
                                <span
                                    className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    3
                                </span>
                            )}
                        </button>

                        {/* Help Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsHelpOpen(!isHelpOpen)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                                aria-label="Help"
                            >
                                <HelpCircle size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>

                            <AnimatePresence>
                                {isHelpOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 py-2 z-50"
                                    >
                                        <Link
                                            to="/help"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => setIsHelpOpen(false)}
                                        >
                                            Help Center
                                        </Link>
                                        <Link
                                            to="/contact"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => setIsHelpOpen(false)}
                                        >
                                            Contact Us
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => handleProtectedAction(() => navigate('/watchlist'))}
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                            <Heart size={14} />
                            Watchlist
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Navbar - Bootstrap-like Responsive Layout */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3">
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Logo - Responsive sizing */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight whitespace-nowrap" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bid</span>
                            <span className="text-white transition-colors">Stream</span>
                        </div>
                    </Link>

                    {/* Search Bar - Always visible, fully responsive - Expanded width */}
                    <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-[80vw] sm:max-w-[70vw] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 sm:px-4">
                        <div className="relative flex-1 flex items-center bg-slate-800 border-2 border-slate-700 rounded-l-full focus-within:border-blue-500 focus-within:shadow-lg transition-all h-9 sm:h-10 md:h-11">
                            {/* Category Dropdown - Responsive scaling */}
                            <div className="relative h-full flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className="h-full flex items-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-5 border-r border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer rounded-l-full"
                                >
                                    <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-300 whitespace-nowrap max-w-[60px] sm:max-w-none overflow-hidden text-ellipsis">
                                        {selectedCategory}
                                    </span>
                                    <ChevronDown size={12} className={`sm:w-4 sm:h-4 text-gray-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isCategoryOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 mt-2 w-48 sm:w-56 md:w-64 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50"
                                        >
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategory(category);
                                                        setIsCategoryOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer ${selectedCategory === category
                                                        ? 'bg-blue-900/20 text-blue-400 font-semibold'
                                                        : 'text-gray-300 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Search Input - Responsive sizing */}
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 bg-transparent outline-none text-xs sm:text-sm md:text-base text-white placeholder-gray-500 w-full min-w-0"
                            />
                        </div>

                        {/* Search Button - Responsive sizing */}
                        <button
                            type="submit"
                            className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-full transition-all flex items-center justify-center hover:shadow-lg cursor-pointer h-9 sm:h-10 md:h-11"
                        >
                            <Search size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline ml-2 text-xs md:text-sm lg:text-base">Search</span>
                        </button>
                    </form>

                    {/* Right Actions - Always visible, responsive sizing */}
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-8">
                        {!user ? (
                            <>
                                {/* Desktop/Tablet Buttons - Hidden on Mobile */}
                                <div className="hidden sm:flex items-center gap-2 sm:gap-3 md:gap-4">
                                    <Link
                                        to="/login"
                                        className="px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-300 hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] sm:text-xs md:text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                                    >
                                        Register
                                    </Link>
                                </div>

                                {/* Mobile User Menu - Visible ONLY on Mobile */}
                                <div className="relative sm:hidden">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="w-9 h-9 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-full text-gray-300 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
                                    >
                                        <User size={18} />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-3 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                                            >
                                                <Link
                                                    to="/login"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="w-full px-4 py-3 text-sm font-semibold text-center text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                                                >
                                                    Sign In
                                                </Link>
                                                <Link
                                                    to="/register"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="w-full px-4 py-3 text-sm font-bold text-center text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all shadow-lg"
                                                >
                                                    Create Account
                                                </Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Wishlist with badge - Responsive */}
                                <button
                                    onClick={() => handleProtectedAction(() => navigate('/wishlist'))}
                                    className="relative p-1 sm:p-1.5 md:p-2 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                                    aria-label="Wishlist"
                                >
                                    <Heart size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
                                    <span
                                        className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[8px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                                        3
                                    </span>
                                </button>

                                {/* Sell Products Button - Responsive */}
                                <button
                                    onClick={handleSwitchToSeller}
                                    className="px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[10px] sm:text-xs md:text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-1 sm:gap-2 cursor-pointer"
                                    aria-label="Sell Products"
                                >
                                    <Store size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    <span className="hidden sm:inline">Sell</span>
                                    <span className="hidden md:inline">Products</span>
                                </button>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="p-1 sm:p-1.5 md:p-2 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                                        aria-label="Profile Menu"
                                    >
                                        <User size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-slate-50 dark:border-slate-800 mb-2">
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 italic">
                                                        Account Center
                                                    </p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                                        {user?.email || "User"}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Link to="/profile" onClick={() => setIsProfileOpen(false)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer group">
                                                        <User size={18} className="group-hover:text-blue-600 transition-colors" />
                                                        <span>My Profile</span>
                                                    </Link>
                                                    <Link to="/watchlist" onClick={() => setIsProfileOpen(false)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer group">
                                                        <Heart size={18} className="group-hover:text-blue-600 transition-colors" />
                                                        <span>Watchlist</span>
                                                    </Link>
                                                    <Link to="/settings" onClick={() => setIsProfileOpen(false)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer group">
                                                        <Settings size={18} className="group-hover:text-blue-600 transition-colors" />
                                                        <span>Settings</span>
                                                    </Link>
                                                    <Link to="/help" onClick={() => setIsProfileOpen(false)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer group">
                                                        <HelpCircle size={18} className="group-hover:text-blue-600 transition-colors" />
                                                        <span>Help & Support</span>
                                                    </Link>
                                                </div>
                                                <button onClick={() => { logout(); setIsProfileOpen(false); }}
                                                    className="w-full text-left p-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all flex items-center gap-3 mt-4 cursor-pointer">
                                                    <LogOut size={18} /> Logout
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Ribbon - Always visible, responsive sizing */}
            <div className="border-t border-slate-700 bg-slate-900 transition-colors duration-300">
                <div className="max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6">
                    <nav className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 py-1.5 sm:py-2 md:py-3 overflow-x-auto scrollbar-hide">
                        {ribbonCategories.map((category) => (
                            <Link
                                key={category}
                                to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap
                                    text-gray-300
                                    hover:text-white
                                    relative group
                                    transition-colors duration-200
                                    cursor-pointer"
                            >
                                {category}
                                {/* Hover underline */}
                                <span className="absolute bottom-[-6px] sm:bottom-[-8px] md:bottom-[-12px] left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>


        </nav>
    );
};

export default PublicNavbar;
