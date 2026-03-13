import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

const BidBuddy = ({ isOpen, setIsOpen }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="mb-6 w-[400px] h-[550px] bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-colors"
                    >
                        <div
                            className="bg-bidstream-blue p-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div
                                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2)_0%,_transparent_60%)]" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                    <Bot size={28} /></div>
                                <div>
                                    <p className="text-lg font-black uppercase tracking-tighter leading-none mb-1">BidBuddy
                                        AI</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Neural Network Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"><X
                                    size={20} /></button>
                        </div>
                        <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-950 flex flex-col gap-6 overflow-y-auto">
                            <div
                                className="bg-white dark:bg-gray-900 p-6 rounded-3xl rounded-bl-none shadow-sm max-w-[90%] border border-gray-100 dark:border-gray-800">
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">"Welcome
                                    to the inner circle. <br /><br /> Searching for a specific investment, or should I
                                    scout the ending-soon lots for you?"</p>
                            </div>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-3">
                            <input type="text" placeholder="Speak to BidBuddy..."
                                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-6 py-4 outline-none text-sm font-black dark:text-white" />
                            <button
                                className="bg-bidstream-blue text-white p-4 rounded-2xl shadow-lg active:scale-90 transition-transform">
                                <Send size={18} /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-bidstream-blue text-white p-4 rounded-full shadow-2xl cursor-pointer relative overflow-hidden flex items-center gap-3 active:scale-90 transition-transform"
                animate={{ width: isHovered ? '220px' : '68px' }}
            >
                <div className="relative">
                    <MessageSquare size={24} className="shrink-0" />
                    {isHovered && <Sparkles size={10} className="absolute -top-1 -right-1 text-white animate-bounce" />}
                </div>
                {isHovered && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="font-black text-xs uppercase tracking-widest whitespace-nowrap">Ask
                    BidBuddy AI</motion.span>}
                <div
                    className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full animate-[spin_25s_linear_infinite]" />
            </motion.div>
        </div>
    );
};

export default BidBuddy;