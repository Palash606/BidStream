import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CountryCodeSelector = ({ value, onChange, countries }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    // Filter logic based on name or dial_code
    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial_code.includes(search)
    );

    // Find selected country or default to India
    const selectedCountry = countries.find(c => c.dial_code === value) ||
        countries.find(c => c.code === 'IN');

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-slate-300 mb-2 mt-0.5 ml-1">Country details</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:border-slate-600 transition-all focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
                <div className="flex items-center gap-2">
                    <img
                        src={`https://flagcdn.com/w20/${selectedCountry?.code.toLowerCase()}.png`}
                        alt={selectedCountry?.name}
                        className="w-5 rounded-sm shadow-sm"
                    />
                    <span className="text-sm font-bold">{selectedCountry?.dial_code}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-800/50 text-white placeholder-slate-500 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-transparent transition-all"
                                    placeholder="Search country or code..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((c) => (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => { onChange(c.dial_code); setIsOpen(false); }}
                                        className="flex items-center gap-3 w-full px-5 py-3.5 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0"
                                    >
                                        <img src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} className="w-5 rounded-sm shadow-sm" alt="" />
                                        <span className="text-xs font-medium text-slate-300 flex-1 text-left">{c.name}</span>
                                        <span className="text-xs font-bold text-slate-500">{c.dial_code}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-500">No results found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CountryCodeSelector;