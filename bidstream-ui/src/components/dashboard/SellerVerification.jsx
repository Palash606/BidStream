import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, Globe, Landmark, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Building2, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../stores';
import { authAPI } from '../../api/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SellerVerification = () => {
    const user = useAuthStore((state) => state.user);
    const checkVerificationStatus = useAuthStore((state) => state.checkVerificationStatus);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [sellerType, setSellerType] = useState('DOMESTIC'); // DOMESTIC or INTERNATIONAL
    const [formData, setFormData] = useState({
        aadharNumber: '',
        gstNumber: '',
        passportNumber: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Submitting verification details...');

        try {
            await authAPI.verifySeller({
                email: user.email,
                sellerType,
                ...formData
            });
            
            // Re-sync store state immediately
            await checkVerificationStatus();
            
            toast.success('Verification successful! Dashboard unlocked.', { id: loadingToast });
            navigate('/seller');
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(error.message || 'Verification failed', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 p-12 shadow-2xl overflow-hidden relative"
                >
                    {/* Background Decorative Element */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                            <ShieldCheck size={40} />
                        </div>
                        
                        <div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">
                                Seller <span className="text-indigo-500">Verification</span>
                            </h2>
                            <p className="max-w-xl text-slate-400 font-medium text-lg leading-relaxed">
                                Whoops! Before you can dive into high-stakes auctions, we need to verify your credentials. 
                                Providing your ID/GST ensures a secure and trustworthy marketplace for everyone.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-8 mt-4">
                            {/* Seller Type Toggle */}
                            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                                <button 
                                    type="button"
                                    onClick={() => setSellerType('DOMESTIC')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sellerType === 'DOMESTIC' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Building2 size={16} /> Domestic
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setSellerType('INTERNATIONAL')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sellerType === 'INTERNATIONAL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Globe size={16} /> International
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {sellerType === 'DOMESTIC' ? (
                                    <motion.div 
                                        key="domestic"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 group-focus-within:text-indigo-400 transition-colors">Aadhar Number (12 Digits)</label>
                                            <div className="relative">
                                                <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="XXXX XXXX XXXX"
                                                    value={formData.aadharNumber}
                                                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all text-white font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 group-focus-within:text-indigo-400 transition-colors">GST Identification Number</label>
                                            <div className="relative">
                                                <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="22AAAAA0000A1Z5"
                                                    value={formData.gstNumber}
                                                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all text-white font-bold"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="intl"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 group-focus-within:text-indigo-400 transition-colors">Passport Number</label>
                                            <div className="relative">
                                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="PXXXXXXX"
                                                    value={formData.passportNumber}
                                                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all text-white font-bold"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button 
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? 'Processing...' : 'Complete Verification'}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase text-slate-600 tracking-widest">
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Secure Encryption</span>
                                <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Regulatory Compliant</span>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <BenefitCard 
                        icon={<Sparkles className="text-indigo-400" />} 
                        title="Instant Access" 
                        desc="List unlimited products across all categories immediately after verification."
                    />
                    <BenefitCard 
                        icon={<Landmark className="text-indigo-400" />} 
                        title="Protected Payouts" 
                        desc="Enjoy faster payment cycles and multi-currency support for your sales."
                    />
                    <BenefitCard 
                        icon={<ShieldCheck className="text-indigo-400" />} 
                        title="Seller Shield" 
                        desc="Advanced fraud protection and dedicated resolution services for verified shops."
                    />
                </div>
            </div>
        </div>
    );
};

const BenefitCard = ({ icon, title, desc }) => (
    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
            {icon}
        </div>
        <h4 className="text-white font-black uppercase tracking-tight mb-2 italic">{title}</h4>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
);

export default SellerVerification;
