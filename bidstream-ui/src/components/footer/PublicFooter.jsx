import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Twitter, Linkedin, Instagram, Heart } from 'lucide-react';

/**
 * PublicFooter - Professional footer with theme-aware styling
 */
const PublicFooter = () => {
    return (
        <footer className="pt-20 pb-12 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="text-3xl font-extrabold tracking-tight mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bid</span>
                            <span className="text-slate-900 dark:text-white">Stream</span>
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 font-medium leading-relaxed max-w-md mb-8">
                            The world's most exclusive auction platform trusted by collectors, sellers, and enthusiasts.
                            Where value meets velocity.
                        </p>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-gray-300 mb-3">
                                Stay Updated
                            </h4>
                            <div className="flex gap-2 max-w-md">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                                />
                                <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-gray-300 mb-6">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {['About Us', 'How It Works', 'Active Auctions', 'Daily Deals'].map((link) => (
                                <li key={link}>
                                    <Link to="#" className="text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white font-medium text-sm transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-gray-300 mb-6">
                            Support
                        </h4>
                        <ul className="space-y-3">
                            {['Help Center', 'FAQs', 'Safety & Trust', 'Security Policy'].map((link) => (
                                <li key={link}>
                                    <Link to="#" className="text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white font-medium text-sm transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <a href="mailto:support@bidstream.com" className="text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white font-medium text-sm transition-colors flex items-center gap-2">
                                    <Mail size={14} /> support@bidstream.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-200 dark:bg-slate-800/80 mb-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Legal Links */}
                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-gray-400">
                        <Link to="/terms" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/cookies" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                            Cookie Settings
                        </Link>
                    </div>

                    {/* Social Media */}
                    <div className="flex items-center gap-3">
                        {[
                            { icon: Twitter, href: 'https://twitter.com' },
                            { icon: Linkedin, href: 'https://linkedin.com' },
                            { icon: Instagram, href: 'https://instagram.com' }
                        ].map(({ icon: Icon, href }, idx) => (
                            <a
                                key={idx}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center transition-all group hover:scale-105 shadow-sm"
                            >
                                <Icon size={16} className="text-slate-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-white transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 dark:text-gray-500 flex items-center justify-center gap-1.5 flex-wrap">
                        <span>© 2026 BidStream.</span>
                        <span className="flex items-center gap-1">
                            Crafted with <Heart size={12} className="text-red-500" fill="currentColor" /> for distributed real-time auctions.
                        </span>
                        <span className="hidden sm:inline text-slate-400 dark:text-slate-700">|</span>
                        <span className="w-full sm:w-auto mt-1 sm:mt-0 italic opacity-80">Where Value Meets Velocity.</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
