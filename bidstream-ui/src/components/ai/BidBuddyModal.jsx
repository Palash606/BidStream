import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';

/**
 * BidBuddy AI Modal - Glassmorphic chat interface
 * Opens as a modal overlay, not a page redirect
 */
const BidBuddyModal = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi! I'm BidBuddy. How can I help you today?", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        // Add user message
        const userMessage = { role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Simulate AI typing
        setIsTyping(true);
        setTimeout(() => {
            const aiResponse = {
                role: 'ai',
                text: "I'm here to help! While I'm not fully integrated yet, I'll soon be able to assist with bid recommendations, product searches, and auction insights. Stay tuned!",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop overlay - click to close */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[199] bg-black/20 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Floating Popover - positioned above AI button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-8 w-96 h-[500px] glass-card-dark rounded-3xl shadow-2xl z-[200] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse-slow">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white">BidBuddy AI</h2>
                                    <p className="text-[10px] text-gray-400">Your intelligent assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400 hover:text-white" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                            : 'bg-white/10 text-gray-200'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <span className="text-xs opacity-60 mt-1 block">
                                            {msg.timestamp.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                                        <Loader2 size={16} className="text-cyan-400 animate-spin" />
                                        <span className="text-gray-400 text-sm">BidBuddy is typing...</span>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything about auctions..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <Send size={18} className="text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BidBuddyModal;
