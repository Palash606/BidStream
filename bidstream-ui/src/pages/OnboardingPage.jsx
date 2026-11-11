import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores';
import { authService } from '../api/authService';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Gavel, CheckCircle2, ShieldCheck, User, ArrowRight } from 'lucide-react';
import FullPageLoader from '../components/ui/FullPageLoader';

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
    })
};



const OnboardingPage = () => {
    const user = useAuthStore((state) => state.user);
    const updateUserRole = useAuthStore((state) => state.updateUserRole);

    const [[page, direction], setPage] = useState([0, 0]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Form States
    const [acceptedRules, setAcceptedRules] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const slides = [
        { id: 'welcome', title: 'Welcome to BidStream' },
        { id: 'rules', title: 'Platform Rules' },
        { id: 'role', title: 'Select Your Path' },
        { id: 'categories', title: 'Preferences' },
        { id: 'ready', title: 'Let\'s Roll' }
    ];

    const getTheme = () => {
        const isBidder = selectedRole === 'BIDDER';
        return {
            primary: isBidder ? 'purple' : 'blue',
            gradient: isBidder ? 'from-purple-600 to-fuchsia-600' : 'from-blue-600 to-indigo-600',
            button: isBidder ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25',
            cardSelected: isBidder ? 'bg-purple-600/20 border-purple-500' : 'bg-blue-600/20 border-blue-500',
            icon: isBidder ? 'text-purple-400' : 'text-blue-400',
            indicator: isBidder ? 'border-purple-500 bg-purple-500' : 'border-blue-500 bg-blue-500',
            blob: isBidder ? 'bg-purple-600/20' : 'bg-blue-600/20'
        };
    };

    const theme = getTheme();

    const paginate = (newDirection) => {
        // Since no back button strictly, we only ever go forward (1).
        if (newDirection === 1 && page < slides.length - 1) {
            setPage([page + newDirection, newDirection]);
        }
    };

    // Prevent manual escape if they haven't finished
    useEffect(() => {
        if (!useAuthStore.getState().isOnboardingPending()) {
            navigate(user?.activeRole === 'SELLER' || user?.activeRole === 'ROLE_SELLER' ? '/seller' : '/');
        }
    }, [navigate, user]);

    const handleRoleSelection = async () => {
        setLoading(true);
        const toastId = toast.loading('Finalizing your account...');
        try {
            // Send the chosen role and interests
            const res = await authService.switchRole(user.email, selectedRole, selectedCategories);

            // The backend issues brand new JWT tokens containing the finalized role
            // We must save these so the role persists across page refreshes
            useAuthStore.getState().login(res.data);

            // Force the Zustand state update to immediately break the gatekeeper lock
            updateUserRole(selectedRole);
            toast.success(`Welcome to BidStream!`, { id: toastId });

            // Smart redirection based on chosen role
            if (selectedRole === 'ROLE_SELLER' || selectedRole === 'SELLER') {
                navigate('/seller');
            } else {
                navigate('/');
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to setup account. Please try again.';
            toast.error(errorMessage, { id: toastId });
            console.error('Role update failed:', error);
            setLoading(false);
        }
    };

    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    if (loading) {
        return <FullPageLoader message="Preparing your dashboard..." />;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-white font-sans">
            {/* Background Animations */}
            <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${theme.blob} blur-[120px] rounded-full mix-blend-screen pointer-events-none transition-colors duration-1000`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${selectedRole ? theme.blob : 'bg-purple-600/20'} blur-[120px] rounded-full mix-blend-screen pointer-events-none transition-colors duration-1000`} />

            {/* Progress Bar Header */}
            <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-center z-50">
                <div className="w-full max-w-2xl bg-slate-800/50 h-2 rounded-full overflow-hidden backdrop-blur-md">
                    <motion.div
                        className={`h-full bg-gradient-to-r ${theme.gradient}`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${((page + 1) / slides.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>

            <div className="relative w-full max-w-2xl h-[600px] flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl"
                    >

                        {/* Slide 1: Welcome & Info */}
                        {page === 0 && (
                            <div className="text-center w-full max-w-md">
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring" }}
                                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                                >
                                    <Gavel className="w-12 h-12 text-white" />
                                </motion.div>
                                <h1 className="text-4xl font-black mb-4 tracking-tight">BidStream</h1>
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                    The next-generation live bidding platform. Discover rare items, engage in real-time auctions, and experience the thrill of the win.
                                </p>

                                <div className="grid grid-cols-3 gap-4 mb-10 text-center text-sm font-medium text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-slate-800 rounded-full text-blue-400"><Store size={20} /></div>
                                        <span>Verified Sellers</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-slate-800 rounded-full text-purple-400"><CheckCircle2 size={20} /></div>
                                        <span>Secure Bids</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-slate-800 rounded-full text-emerald-400"><ShieldCheck size={20} /></div>
                                        <span>Safe Payments</span>
                                    </div>
                                </div>

                                <button onClick={() => paginate(1)} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                                    Get Started <ArrowRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* Slide 2: Rules */}
                        {page === 1 && (
                            <div className="w-full max-w-lg flex flex-col h-full py-4">
                                <div className="text-center mb-6 shrink-0">
                                    <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                    <h2 className="text-3xl font-bold">Rules & Regulations</h2>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 mb-6 space-y-4 custom-scrollbar text-sm text-slate-300">
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                        <h4 className="font-bold text-white mb-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" />Binding Contracts</h4>
                                        <p>Every bid placed on BidStream is considered a legally binding contract. Do not place bids if you are unable to complete the purchase.</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                        <h4 className="font-bold text-white mb-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" />Accurate Listings</h4>
                                        <p>Sellers are required to provide 100% accurate descriptions, authentic images, and actively disclose any damage or defects.</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                        <h4 className="font-bold text-white mb-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" />Payment Deadlines</h4>
                                        <p>Winning bidders must submit full payment through our secure gateway within 48 hours of the auction successfully closing.</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                        <h4 className="font-bold text-white mb-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" />No Shill Bidding</h4>
                                        <p>Artificial inflation of bids using alternate accounts or associates is strictly prohibited and leads to a permanent ban.</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                        <h4 className="font-bold text-white mb-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" />Dispute Resolution</h4>
                                        <p>All disputes regarding authenticity or shipping must be reported within 3 days of delivery to be eligible for platform mediation.</p>
                                    </div>
                                </div>

                                <div className="shrink-0 mt-auto">
                                    <label className="flex items-center gap-3 mb-6 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${acceptedRules ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-emerald-500'}`}>
                                            {acceptedRules && <CheckCircle2 size={16} className="text-white" />}
                                        </div>
                                        <span className="text-slate-300 font-medium select-none">I accept the rules and regulations for fair bidding and payment.</span>
                                        <input type="checkbox" className="hidden" checked={acceptedRules} onChange={(e) => setAcceptedRules(e.target.checked)} />
                                    </label>

                                    <button
                                        disabled={!acceptedRules}
                                        onClick={() => paginate(1)}
                                        className={`w-full py-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${acceptedRules ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Slide 3: Role Selection */}
                        {page === 2 && (
                            <div className="text-center w-full max-w-lg">
                                <h2 className="text-4xl font-black mb-2 tracking-tight">Choose Your Path</h2>
                                <p className="text-slate-400 mb-10 text-lg">Select how you want to interact on BidStream.</p>

                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    <button
                                        onClick={() => setSelectedRole('BIDDER')}
                                        className={`relative group p-8 border rounded-3xl transition-all overflow-hidden ${selectedRole === 'BIDDER' ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRole === 'BIDDER' ? 'border-purple-500 bg-purple-500' : 'border-slate-600'}`}>
                                            {selectedRole === 'BIDDER' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <Gavel className={`w-16 h-16 mx-auto mb-4 ${selectedRole === 'BIDDER' ? 'text-purple-400' : 'text-slate-400'}`} />
                                        <h3 className="text-2xl font-bold mb-2">Bidder</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            Discover rare items, place live bids, and win auctions instantly.
                                        </p>
                                    </button>

                                    <button
                                        onClick={() => setSelectedRole('SELLER')}
                                        className={`relative group p-8 border rounded-3xl transition-all overflow-hidden ${selectedRole === 'SELLER' ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRole === 'SELLER' ? 'border-blue-500 bg-blue-500' : 'border-slate-600'}`}>
                                            {selectedRole === 'SELLER' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <Store className={`w-16 h-16 mx-auto mb-4 ${selectedRole === 'SELLER' ? 'text-blue-400' : 'text-slate-400'}`} />
                                        <h3 className="text-2xl font-bold mb-2">Seller</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            List items, manage auctions, and reach thousands of daily buyers.
                                        </p>
                                    </button>
                                </div>

                                <button
                                    disabled={!selectedRole}
                                    onClick={() => paginate(1)}
                                    className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${selectedRole ? `bg-white text-slate-900 hover:bg-slate-200 shadow-lg shadow-white/20` : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Slide 4: Categories (Optional) */}
                        {page === 3 && (
                            <div className="w-full max-w-lg text-center">
                                <h2 className="text-3xl font-bold mb-2">What Interests You?</h2>
                                <p className="text-slate-400 mb-8">Select categories so we can personalize your feed.</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                    {['Watches', 'Art', 'Jewellery', 'Collectibles', 'Automobiles', 'Electronics', 'Currency', 'Furniture', 'Fashion', 'Instruments', 'Books', 'Wine', 'Other'].map((cat) => {
                                        const isSelected = selectedCategories.includes(cat);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                className={`p-4 border rounded-xl transition-all text-sm font-medium ${isSelected ? `${theme.cardSelected} ${theme.text}` : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500/50'}`}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-4 items-center">
                                    <button onClick={() => paginate(1)} className="w-1/3 py-4 text-slate-400 font-bold hover:text-white transition-colors">
                                        Skip
                                    </button>
                                    <button
                                        onClick={() => paginate(1)}
                                        disabled={selectedCategories.length === 0}
                                        className={`w-2/3 py-4 font-bold rounded-xl transition-all shadow-lg ${selectedCategories.length > 0 ? `${theme.button} text-white` : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'}`}
                                    >
                                        Continue {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Slide 5: Let's Roll */}
                        {page === 4 && (
                            <div className="text-center w-full max-w-md">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={`w-32 h-32 mx-auto mb-8 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center relative shadow-2xl ${selectedRole === 'BIDDER' ? 'shadow-purple-500/30' : 'shadow-blue-500/30'}`}
                                >
                                    <div className="absolute inset-2 border-2 border-white/20 rounded-full border-dashed animate-spin-slow"></div>
                                    <User className="w-16 h-16 text-white" />
                                </motion.div>
                                <h2 className="text-4xl font-black mb-4 tracking-tight">Looks like you're ready.</h2>
                                <p className="text-slate-400 text-xl font-medium italic mb-12">
                                    "The best deals go to the swiftest bidders."
                                </p>

                                <button
                                    onClick={handleRoleSelection}
                                    className={`relative overflow-hidden w-full group py-5 bg-white text-slate-900 font-black text-lg rounded-2xl transition-transform hover:scale-[1.02] active:scale-95 shadow-2xl ${selectedRole === 'BIDDER' ? 'shadow-purple-500/20' : 'shadow-blue-500/20'}`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">Let's Roll <ArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
                                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                </button>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OnboardingPage;
