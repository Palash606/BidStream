import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ContactSection - Theme-aware contact form and information
 * Deep Navy gradient for dark mode, Soft Grey-White for light mode
 */
const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email Us',
            value: 'support@bidstream.com',
            link: 'mailto:support@bidstream.com'
        },
        {
            icon: Phone,
            title: 'Call Us',
            value: '+1 (555) 123-4567',
            link: 'tel:+15551234567'
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            value: '123 Auction Ave, San Francisco, CA 94102',
            link: 'https://maps.google.com'
        }
    ];

    return (
        <section className="py-24 bg-slate-950 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl font-black mb-4 text-white">
                        Get In Touch
                    </h2>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Have questions? We're here to help. Reach out anytime and we'll get back to you soon.
                    </p>
                </motion.div>

                {/* Contact Grid */}
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                        <h3 className="text-2xl font-bold mb-6 text-white">
                            Send us a Message
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            {/* Message Textarea */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Your Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                                    placeholder="Tell us how we can help..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <Send size={20} />
                                Send Message
                            </button>
                        </form>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="space-y-8"
                    >
                        <div>
                            <h3 className="text-2xl font-bold mb-6 text-white">
                                Contact Information
                            </h3>
                            <p className="text-gray-300 mb-8">
                                We're available Monday through Friday, 9AM - 6PM PST. For urgent inquiries, please call us directly.
                            </p>
                        </div>

                        {/* Contact Info Cards */}
                        <div className="space-y-4">
                            {contactInfo.map((info, index) => {
                                const Icon = info.icon;
                                return (
                                    <motion.a
                                        key={index}
                                        href={info.link}
                                        target={info.icon === MapPin ? '_blank' : undefined}
                                        rel={info.icon === MapPin ? 'noopener noreferrer' : undefined}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                        className="flex items-start gap-4 p-5 bg-slate-800 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all hover:shadow-lg group"
                                    >
                                        <div className="p-3 bg-blue-900/30 rounded-xl group-hover:bg-blue-500 transition-colors">
                                            <Icon className="text-blue-400 group-hover:text-white" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">
                                                {info.title}
                                            </h4>
                                            <p className="text-gray-300">
                                                {info.value}
                                            </p>
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-8 p-6 bg-slate-800 rounded-2xl border border-slate-700">
                            <h4 className="font-bold text-white mb-3">
                                Why Contact Us?
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Fast response times (usually within 24 hours)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Dedicated support team for buyers and sellers
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Secure communication and data protection
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
