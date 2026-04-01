import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Calendar, Info, Mail, Phone, CheckCircle, IndianRupee } from 'lucide-react';

const CATEGORY_GRADIENTS = {
    'Luxury Watches':       'from-indigo-600/30 to-indigo-900/20',
    'Fine Art & Paintings': 'from-amber-600/30 to-amber-900/20',
    'Vintage Jewellery':    'from-pink-600/30 to-pink-900/20',
    'Electronics & Gadgets':'from-emerald-600/30 to-emerald-900/20',
    'Designer Fashion':     'from-purple-600/30 to-purple-900/20',
    'Musical Instruments':  'from-blue-600/30 to-blue-900/20',
    'Rare Coins & Currency':'from-yellow-600/30 to-yellow-900/20',
    'Antique Furniture':    'from-orange-600/30 to-orange-900/20',
};

const AdPlacementModal = ({ product, isOpen, onClose }) => {
    const [bidAmount, setBidAmount] = useState('');
    const [duration, setDuration] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const amountNum = parseFloat(bidAmount) || 0;
    const durationNum = parseInt(duration) || 0;
    const amountPerDay = durationNum > 0 && amountNum > 0 ? Math.round(amountNum / durationNum) : 0;

    const validate = () => {
        const errs = {};
        if (!bidAmount) errs.amount = 'Bid amount is required';
        else if (amountNum < 499) errs.amount = 'Minimum bid amount is ₹499';
        if (!duration) errs.duration = 'Duration is required';
        else if (durationNum < 1) errs.duration = 'Duration must be at least 1 day';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitted(true);
    };

    const handleClose = () => {
        setBidAmount('');
        setDuration('');
        setSubmitted(false);
        setErrors({});
        onClose();
    };

    const fmt = (n) => n.toLocaleString('en-IN');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[80]"
                    />
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                            className="pointer-events-auto w-full max-w-[420px] bg-[#08081a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/60"
                        >
                            {/* Header */}
                            <div className="relative px-6 pt-6 pb-5 border-b border-white/[0.06] bg-gradient-to-br from-indigo-950/60 to-transparent">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X size={15} />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/30 to-purple-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                        <Megaphone size={18} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Place an Ad</h2>
                                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">BidStream Carousel Promotion</p>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-8 text-center space-y-4"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', delay: 0.1, damping: 12 }}
                                            className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
                                        >
                                            <CheckCircle size={30} className="text-emerald-400" />
                                        </motion.div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-black text-white">Application Submitted!</h3>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                                Your ad for <span className="text-white font-bold">{product?.name}</span> has been received. You'll be notified within 24 hours.
                                            </p>
                                        </div>
                                        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Application Summary</p>
                                            <p className="text-[11px] text-slate-300">
                                                ₹{fmt(Math.round(amountNum))} for {durationNum} {durationNum === 1 ? 'day' : 'days'}
                                            </p>
                                            <p className="text-[10px] text-indigo-400 font-bold">₹{fmt(amountPerDay)} / day bid rate</p>
                                        </div>
                                        <button
                                            onClick={handleClose}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all mt-2"
                                        >
                                            Done
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="p-6 space-y-5"
                                    >
                                        {/* Product Preview */}
                                        {product && (
                                            <div className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-gradient-to-r ${CATEGORY_GRADIENTS[product.category] || 'from-slate-800/40 to-transparent'}`}>
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center text-slate-500">
                                                    <Megaphone size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-white truncate">{product.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">
                                                        {product.category} · Starting ₹{fmt(product.startingBid)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Inputs */}
                                        <div className="space-y-4">
                                            {/* Total Bid Amount */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <IndianRupee size={9} /> Total Bid Amount
                                                    <span className="text-slate-600 normal-case font-medium tracking-normal">(min ₹499)</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">₹</span>
                                                    <input
                                                        type="number"
                                                        min="499"
                                                        step="1"
                                                        value={bidAmount}
                                                        onChange={e => { setBidAmount(e.target.value); setErrors(p => ({ ...p, amount: undefined })); }}
                                                        placeholder="499"
                                                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 pl-8 text-sm text-white placeholder-slate-600 focus:outline-none transition-all ${errors.amount ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-white/10 focus:border-indigo-500/50'}`}
                                                    />
                                                </div>
                                                {errors.amount && <p className="text-[10px] text-rose-400 font-bold">{errors.amount}</p>}
                                            </div>

                                            {/* Duration */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Calendar size={9} /> Duration
                                                    <span className="text-slate-600 normal-case font-medium tracking-normal">(days)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={duration}
                                                    onChange={e => { setDuration(e.target.value); setErrors(p => ({ ...p, duration: undefined })); }}
                                                    placeholder="e.g. 7"
                                                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all ${errors.duration ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-white/10 focus:border-indigo-500/50'}`}
                                                />
                                                {errors.duration && <p className="text-[10px] text-rose-400 font-bold">{errors.duration}</p>}
                                            </div>

                                            {/* Live amount/day */}
                                            <AnimatePresence>
                                                {amountPerDay > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -6 }}
                                                        className="flex items-center justify-between p-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-xl"
                                                    >
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bid Rate</p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">Competing daily for top 5 slots</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xl font-black text-indigo-400">₹{fmt(amountPerDay)}</p>
                                                            <p className="text-[9px] text-slate-500 font-bold">per day</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* How it works */}
                                        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <Info size={9} /> How carousel ads work
                                            </p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                                Each day, BidStream selects the <span className="text-white font-bold">top 5 products</span> by daily bid rate for the carousel.
                                                If your product doesn't make the cut,{' '}
                                                <span className="text-emerald-400 font-bold">your full amount is refunded</span>{' '}
                                                and an email notification is sent to you.
                                            </p>
                                        </div>

                                        {/* Cancel contact */}
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">To cancel an active ad, contact admin</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <a href="mailto:admin@bidstream.in" className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors">
                                                    <Mail size={10} /> admin@bidstream.in
                                                </a>
                                                <a href="tel:+919876543210" className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors">
                                                    <Phone size={10} /> +91-98765-43210
                                                </a>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
                                        >
                                            Submit Ad Application
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AdPlacementModal;
