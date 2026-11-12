import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, ShieldCheck, CheckCircle2, ArrowLeft,
    Lock, AlertCircle, Sparkles, Receipt, Download, ExternalLink
} from 'lucide-react';
import { productAPI } from '../api/product';
import { useAuthStore } from '../stores';
import toast from 'react-hot-toast';

const PaymentCheckoutPage = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('123456');
    const [receipt, setReceipt] = useState(null);

    // Form states
    const [cardHolder, setCardHolder] = useState(user?.username || 'Palash Shah');
    const [cardNumber, setCardNumber] = useState('4532 8921 7643 9012');
    const [cardExpiry, setCardExpiry] = useState('12/28');
    const [cvv, setCvv] = useState('888');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productAPI.getProductById(productId);
                setProduct(data);
            } catch (err) {
                console.error('Failed to load auction product:', err);
                toast.error('Could not load product details.');
            } finally {
                setLoading(false);
            }
        };
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, '').substring(0, 16);
        const parts = [];
        for (let i = 0; i < cleaned.length; i += 4) {
            parts.push(cleaned.substring(i, i + 4));
        }
        return parts.join(' ');
    };

    const handleCardNumberChange = (e) => {
        setCardNumber(formatCardNumber(e.target.value));
    };

    const handleExpiryChange = (e) => {
        const cleaned = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (cleaned.length >= 3) {
            setCardExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
        } else {
            setCardExpiry(cleaned);
        }
    };

    const amount = product?.currentHighestBid || product?.initialPrice || 50000;

    const handleInitiatePayment = (e) => {
        e.preventDefault();
        if (cardNumber.replace(/\s+/g, '').length < 16) {
            toast.error('Please enter a valid 16-digit card number.');
            return;
        }
        if (cvv.length < 3) {
            toast.error('Please enter a valid 3-digit CVV.');
            return;
        }
        // Open 3DS OTP modal
        setShowOtpModal(true);
    };

    const handleConfirmOtp = async () => {
        setSubmitting(true);
        try {
            const payload = {
                productId,
                buyerId: user?.id,
                amount,
                cardNumber,
                cardExpiry,
                cvv,
                cardHolderName: cardHolder,
                otp: otp.trim()
            };

            const response = await productAPI.processMockPayment(payload);
            setReceipt(response);
            setShowOtpModal(false);
            toast.success('Payment settled successfully!');
        } catch (err) {
            console.error('Settlement error:', err);
            toast.error(err.error || 'Payment failed. Please verify card and OTP.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050510] flex items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold tracking-wider uppercase">Loading Checkout Arena...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050510] text-slate-300 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(productId ? `/product/${productId}` : '/')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all uppercase tracking-wider"
                    >
                        <ArrowLeft size={14} /> Back to Auction Lot
                    </button>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                        <Lock size={12} /> 256-Bit SSL Encrypted Mock Gateway
                    </div>
                </div>

                {/* ── Receipt View (If Settled) ── */}
                {receipt ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.03] border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="text-center space-y-3 pb-8 border-b border-white/10">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 size={36} />
                            </div>
                            <h2 className="text-2xl font-black text-white">Payment & Settlement Confirmed!</h2>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                The auction lot is officially settled. Ownership has transitioned to your BidStream account.
                            </p>
                        </div>

                        {/* Receipt details */}
                        <div className="py-6 space-y-4 max-w-lg mx-auto text-xs">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Transaction ID</span>
                                <span className="font-mono font-bold text-indigo-400">{receipt.transactionId}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Lot Item</span>
                                <span className="font-bold text-white">{receipt.productName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Amount Settled</span>
                                <span className="font-black text-emerald-400 text-sm">₹{receipt.amount?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Payment Method</span>
                                <span className="font-semibold text-slate-300">Debit / Credit Card (Simulated)</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">Settled At</span>
                                <span className="text-slate-300">{new Date(receipt.settledAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={() => navigate(`/product/${productId}`)}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/25"
                            >
                                View Settled Lot
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                            >
                                <Download size={14} /> Print Receipt
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* ── Checkout Form & Interactive Card View ── */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                        {/* Interactive Visual Card (5 Cols) */}
                        <div className="md:col-span-5 space-y-6">
                            {/* Realistic Virtual Card UI */}
                            <motion.div
                                initial={{ rotateY: -10, scale: 0.95 }}
                                animate={{ rotateY: 0, scale: 1 }}
                                className="w-full aspect-[1.586/1] rounded-3xl p-6 bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 border border-white/20 shadow-2xl shadow-indigo-950/50 flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

                                <div className="flex justify-between items-center relative z-10">
                                    <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-300 to-yellow-500 border border-amber-200 shadow-inner flex items-center justify-center opacity-90">
                                        <div className="w-8 h-5 border border-amber-600/50 rounded-sm" />
                                    </div>
                                    <span className="text-xs font-black tracking-widest text-white/80 uppercase">BIDSTREAM PREMIER</span>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <p className="font-mono text-lg md:text-xl font-bold tracking-widest text-white drop-shadow-md">
                                        {cardNumber || '•••• •••• •••• ••••'}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end relative z-10 text-white/90">
                                    <div>
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/60">Cardholder</p>
                                        <p className="text-xs font-black uppercase tracking-wider truncate max-w-[160px]">
                                            {cardHolder || 'FULL NAME'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/60">Expires</p>
                                        <p className="text-xs font-mono font-bold">{cardExpiry || 'MM/YY'}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Order Summary Box */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-3">
                                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Receipt size={14} className="text-indigo-400" /> Auction Lot Summary
                                </h4>
                                <div className="flex justify-between text-xs py-1 border-b border-white/5">
                                    <span className="text-slate-400">Winning Bid</span>
                                    <span className="font-bold text-white">₹{amount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-xs py-1 border-b border-white/5">
                                    <span className="text-slate-400">Platform Handling</span>
                                    <span className="font-bold text-emerald-400">FREE (Trial)</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 font-black">
                                    <span className="text-white">Total Settlement</span>
                                    <span className="text-indigo-400">₹{amount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Card Input Form (7 Cols) */}
                        <div className="md:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-7 space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <CreditCard size={18} className="text-indigo-400" /> Card Details
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Simulate your payment settlement with test card credentials.
                                </p>
                            </div>

                            <form onSubmit={handleInitiatePayment} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                        16-Digit Card Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            maxLength={19}
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="4532 8921 7643 9012"
                                        />
                                        <CreditCard size={16} className="absolute right-3 top-3 text-slate-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                            Expiry Date (MM/YY)
                                        </label>
                                        <input
                                            type="text"
                                            value={cardExpiry}
                                            onChange={handleExpiryChange}
                                            maxLength={5}
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="12/28"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                            CVV / CVC
                                        </label>
                                        <input
                                            type="password"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.substring(0, 4))}
                                            maxLength={4}
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="888"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.99]"
                                    >
                                        Pay ₹{amount.toLocaleString('en-IN')} & Settle Lot
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── 3DS OTP Simulation Modal ── */}
                <AnimatePresence>
                    {showOtpModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                className="bg-[#0b0c1e] border border-white/15 rounded-3xl p-7 max-w-md w-full shadow-2xl relative"
                            >
                                <div className="text-center space-y-2 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-base font-black text-white">3D Secure Bank Verification</h3>
                                    <p className="text-xs text-slate-400">
                                        Enter the 6-digit test authorization OTP code.
                                    </p>
                                </div>

                                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 mb-5 text-[11px] text-indigo-300 text-center font-medium">
                                    Test Code: <span className="font-mono font-bold text-white bg-indigo-500/30 px-2 py-0.5 rounded">123456</span>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.substring(0, 6))}
                                        maxLength={6}
                                        className="w-full text-center text-2xl font-mono font-bold tracking-widest bg-black/50 border border-white/15 rounded-xl py-3 text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="123456"
                                    />

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowOtpModal(false)}
                                            disabled={submitting}
                                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmOtp}
                                            disabled={submitting}
                                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                'Authorize'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default PaymentCheckoutPage;
