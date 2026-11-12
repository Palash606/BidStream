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
    const [winnerModal, setWinnerModal] = useState(false);
    const stompClientRef = useRef(null);
    const audioCtxRef = useRef(null);

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

    // ── Feature 1: Web Audio Gavel Strikes ──────────────────────────────────
    const getAudioCtx = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtxRef.current;
    };

    const playGavelStrike = (stage, delayOffset = 0) => {
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime + delayOffset;

            if (stage === 'GOING_ONCE') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.linearRampToValueAtTime(220, now + 0.4);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.4);
            } else if (stage === 'GOING_TWICE') {
                [0, 0.18].forEach((extra) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const t = now + extra;
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(480, t);
                    osc.frequency.linearRampToValueAtTime(240, t + 0.4);
                    gain.gain.setValueAtTime(0.5, t);
                    gain.gain.linearRampToValueAtTime(0, t + 0.4);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.4);
                });
            } else if (stage === 'SOLD') {
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowshelf';
                filter.frequency.value = 300;
                filter.gain.value = 6;
                filter.connect(ctx.destination);

                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(220, now);
                osc1.frequency.linearRampToValueAtTime(110, now + 0.8);
                gain1.gain.setValueAtTime(0.6, now);
                gain1.gain.linearRampToValueAtTime(0, now + 0.8);
                osc1.connect(gain1);
                gain1.connect(filter);
                osc1.start(now);
                osc1.stop(now + 0.8);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(220, now);
                osc2.frequency.linearRampToValueAtTime(110, now + 0.8);
                gain2.gain.setValueAtTime(0.3, now);
                gain2.gain.linearRampToValueAtTime(0, now + 0.8);
                osc2.connect(gain2);
                gain2.connect(filter);
                osc2.start(now);
                osc2.stop(now + 0.8);
            }
        } catch (err) {
            console.warn('Gavel audio error:', err);
        }
    };

    // Lazy-init AudioContext on first user click (autoplay policy)
    useEffect(() => {
        const initAudio = () => {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initAudio);
        };
        document.addEventListener('click', initAudio);
        return () => document.removeEventListener('click', initAudio);
    }, []);

    // ── Feature 3: Background Tab Title Ticker ───────────────────────────────
    useEffect(() => {
        if (gavelEvent && gavelEvent.stage && gavelEvent.stage !== 'LIVE') {
            if (gavelEvent.stage === 'GOING_ONCE') {
                document.title = `⏰ GOING ONCE — ₹${fmt(currentPrice)} | BidStream`;
            } else if (gavelEvent.stage === 'GOING_TWICE') {
                document.title = `⚠️ GOING TWICE — ₹${fmt(currentPrice)} | BidStream`;
            } else if (gavelEvent.stage === 'SOLD') {
                document.title = `🏆 SOLD — ₹${fmt(currentPrice)} | BidStream`;
            }
        } else {
            document.title = `🔨 [₹${fmt(currentPrice)}] ${product.name} | BidStream`;
        }
        return () => {
            document.title = 'BidStream';
        };
    }, [currentPrice, gavelEvent]);

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
                        const payload = JSON.parse(message.body);
                        setGavelEvent(payload);

                        // Feature 1: Play gavel audio
                        playGavelStrike(payload.stage);

                        // Feature 2: Confetti on gavel events
                        if (payload.stage === 'GOING_ONCE' || payload.stage === 'GOING_TWICE') {
                            confetti({ particleCount: 15, spread: 40, origin: { y: 0.6 } });
                        } else if (payload.stage === 'SOLD') {
                            // Check if current user is the winner
                            try {
                                const token = localStorage.getItem('bidstream_token');
                                let currentUsername = null;
                                if (token) {
                                    const base64Payload = token.split('.')[1];
                                    const decoded = JSON.parse(atob(base64Payload));
                                    currentUsername = decoded.sub || decoded.username || decoded.name || null;
                                }
                                const isWinner =
                                    (payload.winnerMaskedName && currentUsername &&
                                        payload.winnerMaskedName.toLowerCase().includes(currentUsername.slice(0, 3).toLowerCase())) ||
                                    (payload.winnerId && currentUsername &&
                                        payload.winnerId === currentUsername);

                                if (isWinner) {
                                    confetti({
                                        particleCount: 200,
                                        spread: 160,
                                        origin: { y: 0.5 },
                                        colors: ['#FFD700', '#FF6B35', '#6366F1', '#10B981']
                                    });
                                    setWinnerModal(true);
                                }
                            } catch (jwtErr) {
                                console.warn('Could not decode JWT for winner check:', jwtErr);
                            }
                        }
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
            <div className="relative p-6 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-[2rem] backdrop-blur-md overflow-hidden shadow-xl dark:shadow-2xl transition-colors">
                {/* Live Badge & WS status */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Bidding Arena</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {wsConnected ? 'Real-Time Sync' : 'Reconnecting...'}
                        </span>
                    </div>
                </div>

                {/* Current Highest Bid Ticker */}
                <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-emerald-500 dark:text-emerald-400" /> Current Standing Bid
                        </p>
                        <motion.div
                            key={currentPrice}
                            initial={{ scale: 1.08 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
                        >
                            ₹{fmt(currentPrice)}
                        </motion.div>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Minimum Next Bid</p>
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{fmt(minNextBid)}</p>
                    </div>
                </div>

                {isLive ? (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
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
                                            className="px-4 py-3 bg-slate-100 dark:bg-white/[0.04] hover:bg-indigo-600 hover:text-white border border-slate-200 dark:border-white/10 hover:border-indigo-500 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 disabled:opacity-50 cursor-pointer group"
                                        >
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-white">+₹{fmt(inc)}</span>
                                            <span className="text-xs text-slate-900 dark:text-white group-hover:text-white">₹{fmt(targetVal)}</span>
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
                                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-8 pr-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                                />
                            </div>
                            <button
                                onClick={() => handlePlaceBid()}
                                disabled={submitting}
                                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
                    <div className="py-6 text-center space-y-3 border-t border-slate-100 dark:border-white/5">
                        <div className="text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
                            Auction Concluded — Awaiting Winner Settlement
                        </div>
                        <button
                            onClick={() => window.location.href = `/pay/${product.id}`}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                            Complete Settlement & Pay (Mock Checkout)
                        </button>
                    </div>
                ) : product.status === 'SOLD' ? (
                    <div className="py-6 text-center space-y-2 border-t border-slate-100 dark:border-white/5">
                        <div className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <span>Auction Lot Settled & Sold!</span>
                        </div>
                        {product.paymentTransactionId && (
                            <p className="text-[10px] text-slate-500 font-mono">
                                Txn: {product.paymentTransactionId}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="py-6 text-center text-slate-500 text-xs font-black uppercase tracking-widest border-t border-slate-100 dark:border-white/5">
                        Bidding is currently inactive for this lot
                    </div>
                )}
            </div>

            {/* Live Bid Stream / History */}
            <div className="p-6 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-sm backdrop-blur-sm transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <History size={14} className="text-indigo-600 dark:text-indigo-400" /> Live Bid Stream ({bids.length})
                    </p>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase">Instant Updates</span>
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
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: b.userColorHex || '#818cf8' }}
                                    />
                                    <span className="font-bold">{b.maskedName || 'Anonymous Bidder'}</span>
                                    {idx === 0 && (
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wider">
                                            Leading
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-slate-900 dark:text-white">₹{fmt(b.amount)}</span>
                                    <p className="text-[9px] text-slate-500">
                                        {formatBidTime(b.bidTime)}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Feature 2: Winner Modal */}
            <AnimatePresence>
                {winnerModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setWinnerModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 border border-emerald-500/30 rounded-[2rem] p-10 max-w-sm w-full mx-4 text-center shadow-2xl"
                        >
                            <div className="text-6xl mb-4">🏆</div>
                            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Congratulations!</h2>
                            <p className="text-emerald-400 font-black text-sm uppercase tracking-widest mb-6">You Won!</p>
                            <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-1">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Winning Lot</p>
                                <p className="text-white font-black text-base">{product.name}</p>
                                <p className="text-emerald-400 font-black text-2xl mt-1">₹{fmt(currentPrice)}</p>
                            </div>
                            <button
                                onClick={() => { window.location.href = `/pay/${product.id}`; }}
                                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
                            >
                                Complete Settlement &amp; Pay
                            </button>
                            <button
                                onClick={() => setWinnerModal(false)}
                                className="mt-3 text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BidConsole;
