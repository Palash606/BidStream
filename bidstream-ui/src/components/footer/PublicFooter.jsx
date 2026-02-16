import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Twitter, Linkedin, Instagram, Heart } from 'lucide-react';

/**
 * PublicFooter - Professional footer with theme-aware styling
 */
const PublicFooter = () => {
    return (
        <footer
            className="text-white pt-24 pb-12 border-t border-slate-800 transition-all duration-300"
            style={{
                background: 'var(--footer-bg)'
            }}>
            <div className="max-w-[1400px] mx-auto px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="text-3xl font-extrabold tracking-tight mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bid</span>
                            <span className="text-white">Stream</span>
                        </div>
                        <p className="text-gray-400 font-medium leading-relaxed max-w-md mb-8">
                            The world's most exclusive auction platform trusted by collectors, sellers, and enthusiasts.
                            Where value meets velocity.
                        </p>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
                                Stay Updated
                            </h4>
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                                />
                                <button
                                    className="px-7 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold rounded-full transition-all">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-8">
                            Quick Links
                        </h4>
                        <ul className="space-y-4">
                            {['About Us', 'How It Works'].map((link) => (
                                <li key={link}>
                                    <Link to="#" className="text-gray-400 hover:text-white font-medium transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-8">
                            Support
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="#" className="text-gray-400 hover:text-white font-medium transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-400 hover:text-white font-medium transition-colors">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-400 hover:text-white font-medium transition-colors">
                                    Safety Center
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-400 hover:text-white font-medium transition-colors">
                                    Security Center
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:support@bidstream.com"
                                    className="text-gray-400 hover:text-white font-medium transition-colors flex items-center gap-2">
                                    <Mail size={16} />
                                    support@bidstream.com
                                </a>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-400 hover:text-white font-medium transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Legal Links */}
                    <div className="flex flex-wrap items-center gap-8 text-sm text-gray-400">
                        <Link to="/terms" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">
                            Cookie Settings
                        </Link>
                    </div>

                    {/* Social Media */}
                    <div className="flex items-center gap-4">
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
                                className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center transition-all group hover:scale-110"
                            >
                                <Icon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Copyright - Responsive */}
                <div className="mt-8 sm:mt-12 text-center overflow-hidden">
                    <p className="text-[10px] sm:text-sm text-gray-500 flex items-center justify-center gap-1.5 flex-wrap">
                        <span>© 2026 BidStream.</span>
                        <span className="flex items-center gap-1">
                            Made with <Heart size={12} className="text-red-500 sm:w-3.5 sm:h-3.5" fill="currentColor" /> in India.
                        </span>
                        <span className="hidden sm:inline text-gray-700">|</span>
                        <span className="w-full sm:w-auto mt-1 sm:mt-0 italic opacity-80">Where Value Meets Velocity.</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
