import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Search, Bell, PlusCircle, Wallet, Moon, Sun, ChevronDown, BarChart3, Package} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {useAuth} from '../../context/AuthContext';
import {useTheme, getProfileColor} from '../../context/ThemeContext';

const SellerNavbar = () => {
    const {user, logout} = useAuth();
    const {isDark, toggleTheme} = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);

    const username = user?.email?.split('@')[0] || "palash2105";
    const initial = username.charAt(0).toUpperCase();

    return (
        <nav
            className="w-full border-b border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-950 sticky top-0 z-[60] transition-all">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 gap-8">
                <Link to="/"
                      className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">Bid<span
                    className="text-indigo-600">Stream</span></Link>

                <div
                    className="flex-1 max-w-xl flex items-center bg-slate-100 dark:bg-slate-900 rounded-full border-2 border-transparent focus-within:border-indigo-600 overflow-hidden">
                    <div className="px-4 border-r dark:border-slate-800"><Package size={18}
                                                                                  className="text-indigo-600"/></div>
                    <input type="text" placeholder="Search my inventory..."
                           className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm font-bold dark:text-white"/>
                    <button className="bg-indigo-600 text-white px-6 py-2.5"><Search size={18}/></button>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:scale-105 transition-all">
                        <PlusCircle size={16}/> LIST ITEM
                    </button>
                    <button className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 relative"><Wallet
                        size={24}/><span
                        className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950"/>
                    </button>

                    <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black border-2 border-indigo-200 bg-indigo-600 shadow-md transition-all active:scale-90">{initial}</button>
                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                            className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden transition-colors">
                                    <div className="p-4 border-b border-slate-50 dark:border-slate-800 mb-2"><p
                                        className="text-[10px] text-slate-400 font-black uppercase mb-1 italic">Seller
                                        Hub</p><p
                                        className="text-sm font-black text-slate-900 dark:text-white truncate">{user.email}</p>
                                    </div>
                                    <button onClick={toggleTheme}
                                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold dark:text-slate-300">
                                        <div className="flex items-center gap-3">{isDark ?
                                            <Sun size={18} className="text-yellow-500"/> :
                                            <Moon size={18} className="text-indigo-600"/>}<span>Appearance</span></div>
                                        <span
                                            className="text-[10px] font-black uppercase opacity-40">{isDark ? 'Dark' : 'Light'}</span>
                                    </button>
                                    <button onClick={logout}
                                            className="w-full text-left p-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl flex items-center gap-3 mt-4">Logout
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
export default SellerNavbar;