import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Search, Bell, Moon, Sun, ChevronDown, Heart, HelpCircle} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {BidStreamLogo} from '../ui/Logo';
import {useAuth} from '../../context/AuthContext';
import {useTheme, getProfileColor} from '../../context/ThemeContext';

const BidderNavbar = () => {
    const {user, logout} = useAuth();
    const {isDark, toggleTheme} = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const username = user?.email?.split('@')[0] || "palash2105";
    const avatarColor = getProfileColor(username);

    return (
        <nav
            className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-[60] transition-colors duration-300">
            {/* Top Utility Bar */}
            <div className="border-b border-slate-100 dark:border-slate-800 hidden sm:block">
                <div
                    className="mx-auto max-w-[1400px] px-6 py-2 flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <div className="flex gap-8"><span
                        className="hover:text-blue-600 cursor-pointer">Help & Support</span><span
                        className="hover:text-blue-600 cursor-pointer">Daily Deals</span></div>
                    <div className="flex gap-8"><span
                        className="hover:text-blue-600 cursor-pointer flex items-center gap-1.5"><Heart size={12}/> Wishlist</span>
                    </div>
                </div>
            </div>
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 gap-8">
                <Link to="/"><BidStreamLogo/></Link>
                <div
                    className="flex-1 hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all overflow-hidden">
                    <div className="pl-4 border-r border-slate-200 dark:border-slate-700 pr-2">
                        <select
                            className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-slate-500 dark:text-slate-400">
                            <option>All Categories</option>
                        </select>
                    </div>
                    <input type="text" placeholder="Search for items..."
                           className="flex-1 bg-transparent border-none outline-none px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"/>
                    <button
                        className="bg-blue-600 text-white px-8 py-2.5 hover:bg-blue-700 cursor-pointer transition-colors">
                        <Search size={18}/></button>
                </div>
                <div className="flex items-center gap-6">
                    <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 relative cursor-pointer">
                        <Bell size={22}/></button>
                    <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 cursor-pointer group">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black border-2 border-white dark:border-slate-800 shadow-md transition-all group-active:scale-90"
                                style={{backgroundColor: avatarColor}}>{username.charAt(0).toUpperCase()}</div>
                            <ChevronDown size={14}
                                         className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: 10}}
                                            className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden transition-colors">
                                    <div className="p-4 border-b border-slate-50 dark:border-slate-800 mb-2"><p
                                        className="text-[10px] text-slate-400 font-black uppercase mb-1">Bidder
                                        Center</p><p
                                        className="text-sm font-black text-slate-900 dark:text-white truncate">{user.email}</p>
                                    </div>
                                    <button onClick={toggleTheme}
                                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all">
                                        <div className="flex items-center gap-3">{isDark ?
                                            <Sun size={18} className="text-yellow-500"/> :
                                            <Moon size={18} className="text-blue-600"/>}<span>Appearance</span></div>
                                        <span
                                            className="text-[10px] font-black uppercase opacity-40">{isDark ? 'Dark' : 'Light'}</span>
                                    </button>
                                    <button onClick={logout}
                                            className="w-full text-left p-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all flex items-center gap-3 mt-4">Logout
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
export default BidderNavbar;