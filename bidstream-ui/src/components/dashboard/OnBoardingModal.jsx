import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Gavel, Store, CheckCircle2, ChevronRight, Info, Target, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../stores';

const OnboardingModal = ({ isOpen, onClose }) => {
    const user = useAuthStore((state) => state.user);
    const updateUserRole = useAuthStore((state) => state.updateUserRole);
    const [step, setStep] = useState(1);
    const [role, setRole] = useState(null);
    const [accepted, setAccepted] = useState(false);
    const [categories, setCategories] = useState([]);

    const handleNext = () => {
        if (step === 1) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setStep(prev => prev + 1);
    };

    const toggleCategory = (cat) => {
        setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };

    const handleRoleSelection = async (selectedRole) => {
        if (!user?.email) return toast.error("Session missing.");

        const toastId = toast.loading("Configuring your account...");
        try {
            const { data } = await authService.switchRole(user.email, selectedRole);

            // Update local storage with fresh tokens containing the NEW role
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // Update context so the UI unblurs and Navbars swap
            updateUserRole(data.role);

            toast.success(`Role set to ${selectedRole}`, { id: toastId });
            setStep(3); // Move to rules
        } catch (err) {
            toast.error("Persistence failed.", { id: toastId });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.9, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden transition-all duration-500"
                    >
                        {/* Progress Indicator */}
                        <div className="absolute top-0 left-0 h-1.5 bg-indigo-600 transition-all duration-500"
                            style={{ width: `${(step / 5) * 100}%` }} />

                        <div className="p-12 md:p-16 text-center">
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div
                                        className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                        <PartyPopper size={40} className="text-indigo-600" />
                                    </div>
                                    <h2 className="text-4xl font-black dark:text-white mb-4 italic uppercase tracking-tighter">
                                        Welcome, {user?.firstName || 'User'}!
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed">
                                        You've gained access to the world's most exclusive auction platform. Let's
                                        configure your terminal.
                                    </p>
                                    <button onClick={handleNext}
                                        className="bg-indigo-600 text-white px-12 py-4 rounded-full font-black shadow-xl hover:scale-105 transition-all cursor-pointer uppercase text-xs tracking-widest">
                                        BEGIN SETUP
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                    <h2 className="text-3xl font-black dark:text-white mb-2 uppercase italic tracking-tighter">Your
                                        Objective</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-10 flex items-center justify-center gap-2">
                                        <Info size={14} /> This determines your dashboard layout
                                    </p>
                                    <div className="grid grid-cols-2 gap-6 mb-10">
                                        <button onClick={() => handleRoleSelection('SELLER')}
                                            className={`p-8 border-2 rounded-[2.5rem] transition-all flex flex-col items-center gap-4 group ${role === 'SELLER' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                                            <Store size={36}
                                                className={role === 'SELLER' ? 'text-indigo-600' : 'text-slate-400'} />
                                            <span
                                                className="font-black dark:text-white uppercase text-[10px] tracking-widest">I want to Sell</span>
                                        </button>
                                        <button onClick={() => handleRoleSelection('BIDDER')}
                                            className={`p-8 border-2 rounded-[2.5rem] transition-all flex flex-col items-center gap-4 group ${role === 'BIDDER' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                                            <Gavel size={36}
                                                className={role === 'BIDDER' ? 'text-blue-600' : 'text-slate-400'} />
                                            <span
                                                className="font-black dark:text-white uppercase text-[10px] tracking-widest">I want to Bid</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                    <h2 className="text-3xl font-black dark:text-white mb-6 italic uppercase">Gavel
                                        Rules 🔨</h2>
                                    <div
                                        className="h-64 overflow-y-auto text-left space-y-4 mb-8 pr-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 custom-scrollbar">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                            <div key={i}
                                                className="flex gap-3 text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                                                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                                <span>Condition #{i}: All bids on BidStream constitute a legally binding contract between the parties.</span>
                                            </div>
                                        ))}
                                    </div>
                                    <label
                                        className="flex items-center justify-center gap-3 mb-10 cursor-pointer group">
                                        <input type="checkbox" onChange={e => setAccepted(e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span
                                            className="text-[10px] font-black dark:text-white uppercase tracking-widest group-hover:text-indigo-600 transition-colors">I accept the terms & conditions</span>
                                    </label>
                                    <button disabled={!accepted} onClick={handleNext}
                                        className="bg-indigo-600 disabled:opacity-50 text-white px-12 py-4 rounded-full font-black shadow-xl hover:scale-105 transition-all">
                                        AGREE & CONTINUE
                                    </button>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                    <Target size={40} className="text-indigo-600 mx-auto mb-6" />
                                    <h2 className="text-3xl font-black dark:text-white mb-4 italic uppercase">Discovery</h2>
                                    <p className="text-slate-400 font-bold mb-10 uppercase tracking-widest text-[10px]">Select
                                        categories to curate your feed</p>
                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        {['Luxury Cars', 'Timepieces', 'Art', 'Tech'].map(cat => (
                                            <button key={cat} onClick={() => toggleCategory(cat)}
                                                className={`p-4 border-2 rounded-2xl text-xs font-black transition-all ${categories.includes(cat) ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                                                {cat.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <button onClick={handleNext}
                                            className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 transition-colors">Skip
                                        </button>
                                        <button onClick={handleNext}
                                            className="bg-indigo-600 text-white px-10 py-3 rounded-full font-black shadow-lg">CONTINUE
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step >= 5 && (
                                <div className="py-10">
                                    <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-8" />
                                    <h2 className="text-3xl font-black dark:text-white uppercase italic mb-10">Setup
                                        Complete</h2>
                                    <button
                                        onClick={onClose} // This now triggers the navigate('/dashboard') in App.jsx
                                        className="bg-indigo-600 text-white px-12 py-5 rounded-full font-black shadow-xl uppercase text-xs tracking-widest"
                                    >
                                        LAUNCH MY DASHBOARD
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OnboardingModal;