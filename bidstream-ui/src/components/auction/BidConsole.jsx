import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, TrendingUp, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { productAPI } from '../../api/product';
import { toast } from 'react-hot-toast';

const calculateMinIncrement = (currentPrice) => {
    if (!currentPrice || currentPrice < 10000) return 500;
    if (currentPrice < 100000) return 2000;
    if (currentPrice < 1000000) return 10000;
    if (currentPrice < 10000000) return 50000;
    return Math.floor(currentPrice * 0.01);
};

const fmt = (n) => n?.toLocaleString('en-IN') || '0';

const formatBidTime = (timeVal) => {
    if (!timeVal) return 'Just now';
    if (Array.isArray(timeVal)) {
        const d = new Date(timeVal[0], timeVal[1] - 1, timeVal[2], timeVal[3] || 0, timeVal[4] || 0, timeVal[5] || 0);
        return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    const d = new Date(timeVal);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const BidConsole = ({ product, onPriceUpdate }) => {
    const [currentPrice, setCurrentPrice] = useState(
        product.currentHighestBid || product.initialPrice || 0
    );
    const [bids, setBids] = useState([]);
    const [loadingBids, setLoadingBids] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [gavelEvent, setGavelEvent] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const stompClientRef = useRef(null);

    const minIncrement = calculateMinIncrement(currentPrice);
    const minNextBid = currentPrice + minIncrement;

    // Load initial bid history
    useEffect(() => {
        let isMounted = true;
        const fetchHistory = async () => {
            try {
                const history = await productAPI.getBidHistory(product.id);
                if (isMounted) {
                    setBids(history || []);
                    if (history && history.length > 0) {
                        const topBid = history[0];
                        if (topBid.amount > currentPrice) {
                            setCurrentPrice(topBid.amount);
                            onPriceUpdate?.(topBid.amount);
                        }
                    }
                }
            } catch (err) {
                console.warn('Could not load bid history:', err);
            } finally {
                if (isMounted) setLoadingBids(false);
            }
        };
        fetchHistory();
        return () => { isMounted = false; };
    }, [product.id]);

    // WebSocket STOMP Connection Setup
    useEffect(() => {
        const socketUrl = import.meta.env?.VITE_WS_URL || 'http://localhost:8080/ws-auction';

        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 3000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setWsConnected(true);

                // 1. Subscribe to Live Bid Price Ticks & Settlements
                client.subscribe(`/topic/auction/${product.id}`, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        if (payload.type === 'AUCTION_SETTLED') {
                            toast.success('Auction Lot Officially Settled & Sold!', {
                                icon: '💳',
                                style: { borderRadius: '1rem', background: '#0f172a', color: '#fff', fontSize: '12px' }
                            });
                            return;
                        }
                        const newBid = payload;
                        setBids((prev) => {
                            if (prev.length > 0 && prev[0].amount === newBid.amount) {
                                return prev;
                            }
                            return [newBid, ...prev.map(b => ({ ...b, isHighest: false }))];
                        });
                        setCurrentPrice(newBid.amount);
                        onPriceUpdate?.(newBid.amount);

                        // Trigger celebratory confetti on incoming bid
                        confetti({
                            particleCount: 25,
                            spread: 60,
                            origin: { y: 0.8 }
                        });
                        toast.success(`New leading bid: ₹${fmt(newBid.amount)}!`, {
                            icon: '🔥',
                            style: { borderRadius: '1rem', background: '#0f172a', color: '#fff', fontSize: '12px' }
                        });
                    } catch (e) {
                        console.error('Failed to parse bid tick:', e);
                    }
                });

                // 2. Subscribe to Three-Hit Gavel Countdown & Alerts
                client.subscribe(`/topic/auction/${product.id}/gavel`, (message) => {
                    try {
                        const event = JSON.parse(message.body);
                        setGavelEvent(event);
                    } catch (e) {
                        console.error('Failed to parse gavel event:', e);
                    }
                });
            },
            onDisconnect: () => {
                setWsConnected(false);
            },
            onStompError: (frame) => {
                console.warn('STOMP protocol error:', frame.headers['message']);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [product.id]);

    const handlePlaceBid = async (amountToPlace) => {
        const rawVal = amountToPlace !== undefined ? amountToPlace : bidAmount;
        const val = Number(rawVal);
        if (isNaN(val) || val < minNextBid) {
            toast.error(`Minimum acceptable bid is ₹${fmt(minNextBid)}`);
            return;
        }

        setSubmitting(true);
        try {
            await productAPI.placeBid(product.id, val);
            setBidAmount('');
            toast.success(`Bid of ₹${fmt(val)} placed successfully!`);
        } catch (err) {
            let errorMsg = 'Failed to place bid';
            if (typeof err === 'string') {
                errorMsg = err;
            } else if (err?.response?.data) {
                errorMsg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || errorMsg);
            } else if (err?.message) {
                errorMsg = err.message;
            }
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const isLive = product.status === 'ACTIVE';

    return (
        <div className="space-y-6">
            {/* Live Gavel Status Indicator Banner */}
            <AnimatePresence>
                {gavelEvent && gavelEvent.stage && gavelEvent.stage !== 'LIVE' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl border flex items-center justify-between ${
                            gavelEvent.stage === 'SOLD'
                                ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                                : 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔨</span>
                            <div>
                                <p className="text-xs font-black uppercase tracking-wider">{gavelEvent.message}</p>
                                <p className="text-[10px] text-slate-400 font-bold">
                                    {gavelEvent.stage === 'SOLD' ? 'Auction Closed' : 'Place a bid now to reset the countdown!'}
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {gavelEvent.stage}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Arena Console Box */}
            <div className="relative p-6 bg-white/[0.04] border border-white/10 rounded-[2rem] backdrop-blur-md overflow-hidden shadow-2xl">
                {/* Live Badge & WS status */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Live Bidding Arena</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {wsConnected ? 'Real-Time Sync' : 'Reconnecting...'}
                        </span>
                    </div>
                </div>

                {/* Current Highest Bid Ticker */}
                <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-emerald-400" /> Current Standing Bid
                        </p>
                        <motion.div
                            key={currentPrice}
                            initial={{ scale: 1.1, color: '#34d399' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl md:text-5xl font-black text-white tracking-tight"
                        >
                            ₹{fmt(currentPrice)}
                        </motion.div>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Minimum Next Bid</p>
                        <p className="text-lg font-black text-indigo-400">₹{fmt(minNextBid)}</p>
                    </div>
                </div>

                {isLive ? (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        {/* Quick Increment Buttons */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Quick Increments</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[minIncrement, minIncrement * 2, minIncrement * 5].map((inc, i) => {
                                    const targetVal = currentPrice + inc;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handlePlaceBid(targetVal)}
                                            disabled={submitting}
                                            className="px-4 py-3 bg-white/[0.04] hover:bg-indigo-600 hover:text-white border border-white/10 hover:border-indigo-500 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 disabled:opacity-50"
                                        >
                                            <span className="text-[10px] text-slate-400 group-hover:text-white">+₹{fmt(inc)}</span>
                                            <span className="text-xs text-white">₹{fmt(targetVal)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Bid Input & Submit */}
                        <div className="flex gap-3 pt-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                                <input
                                    type="number"
                                    min={minNextBid}
                                    step={minIncrement}
                                    placeholder={`Min: ₹${fmt(minNextBid)}`}
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-8 pr-4 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => handlePlaceBid()}
                                disabled={submitting}
                                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Gavel size={16} /> Place Bid
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : product.status === 'PAYMENT_PENDING' ? (
                    <div className="py-6 text-center space-y-3 border-t border-white/5">
                        <div className="text-amber-400 text-xs font-black uppercase tracking-widest">
                            Auction Concluded — Awaiting Winner Settlement
                        </div>
                        <button
                            onClick={() => window.location.href = `/pay/${product.id}`}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            Complete Settlement & Pay (Mock Checkout)
                        </button>
                    </div>
                ) : product.status === 'SOLD' ? (
                    <div className="py-6 text-center space-y-2 border-t border-white/5">
                        <div className="text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <span>Auction Lot Settled & Sold!</span>
                        </div>
                        {product.paymentTransactionId && (
                            <p className="text-[10px] text-slate-500 font-mono">
                                Txn: {product.paymentTransactionId}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="py-6 text-center text-slate-500 text-xs font-black uppercase tracking-widest border-t border-white/5">
                        Bidding is currently inactive for this lot
                    </div>
                )}
            </div>

            {/* Live Bid Stream / History */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <History size={14} className="text-indigo-400" /> Live Bid Stream ({bids.length})
                    </p>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Instant Updates</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {loadingBids ? (
                        <div className="py-8 text-center text-xs text-slate-500">Loading bid stream...</div>
                    ) : bids.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500">No bids placed yet. Be the first!</div>
                    ) : (
                        bids.map((b, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                                    idx === 0
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                        : 'bg-white/[0.02] border-white/5 text-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: b.userColorHex || '#818cf8' }}
                                    />
                                    <span className="font-bold">{b.maskedName || 'Anonymous Bidder'}</span>
                                    {idx === 0 && (
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wider">
                                            Leading
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-white">₹{fmt(b.amount)}</span>
                                    <p className="text-[9px] text-slate-500">
                                        {formatBidTime(b.bidTime)}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BidConsole;
