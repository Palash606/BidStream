import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';

/**
 * PulseCarousel - Premium hero carousel with boosted products and AI promo
 * Auto-advances every 5s with manual controls
 * @param {Function} onAIChatClick - Callback to open BidBuddy floating chat
 */
const PulseCarousel = ({ onAIChatClick }) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [direction, setDirection] = useState(1);

    // Mock slides data (3 boosted products + 1 AI promo)
    const slides = [
        {
            id: 1,
            type: 'boosted',
            title: '1963 Corvette Sting Ray',
            subtitle: 'Classic American Muscle',
            currentBid: '₹1,15,00,000',
            endingIn: '2h 34m',
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&h=800&fit=crop',
            seller: 'ClassicCarsIndia'
        },
        {
            id: 2,
            type: 'boosted',
            title: 'Audemars Piguet Royal Oak',
            subtitle: 'Limited Edition Timepiece',
            currentBid: '₹42,00,000',
            endingIn: '5h 12m',
            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920&h=800&fit=crop',
            seller: 'LuxuryTimepieces'
        },
        {
            id: 3,
            type: 'boosted',
            title: 'Original Picasso Sketch',
            subtitle: 'Authenticated 1947 Artwork',
            currentBid: '₹2,85,00,000',
            endingIn: '1d 8h',
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&h=800&fit=crop',
            seller: 'FineArtCollective'
        },
        {
            id: 4,
            type: 'ai-promo',
            title: 'Meet BidBuddy AI',
            subtitle: 'Your Neural Auction Assistant',
            description: 'Get instant valuations, bid recommendations, and market insights powered by Gemini Pro',
            ctaText: 'Chat with AI',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=800&fit=crop'
        }
    ];

    // Auto-advance logic
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [isPlaying, currentSlide]);

    const handleNext = () => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction > 0 ? -1000 : 1000,
            opacity: 0
        })
    };

    const currentSlideData = slides[currentSlide];

    return (
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.3 }
                    }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={currentSlideData.image}
                            alt={currentSlideData.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
                        {currentSlideData.type === 'boosted' ? (
                            <div className="flex flex-col justify-center h-full max-w-2xl">
                                {/* Live Badge - Responsive */}
                                <div className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-red-500/90 backdrop-blur-sm rounded-full mb-2 sm:mb-4 md:mb-6 w-fit">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-white uppercase">Live</span>
                                </div>

                                <div>
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-white mb-1 sm:mb-2 md:mb-3 lg:mb-4 tracking-tight">
                                        {currentSlideData.title}
                                    </h1>
                                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 font-medium mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                                        {currentSlideData.subtitle}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                                    <div className="bg-slate-900/60 backdrop-blur-sm border border-white/20 rounded-xl md:rounded-2xl px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
                                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 md:mb-2">Current Bid</p>
                                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white">{currentSlideData.currentBid}</p>
                                    </div>
                                    <div className="bg-slate-900/60 backdrop-blur-sm border border-red-500/50 rounded-xl md:rounded-2xl px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
                                        <p className="text-[10px] sm:text-xs md:text-sm text-red-400 uppercase tracking-wider mb-0.5 sm:mb-1 md:mb-2">Ending In</p>
                                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white">{currentSlideData.endingIn}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                navigate('/login');
                                            } else {
                                                navigate(`/product/${currentSlideData.id}`);
                                            }
                                        }}
                                        className="px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all cursor-pointer"
                                    >
                                        Place Bid Now
                                    </button>
                                    <button
                                        onClick={() => navigate(`/product/${currentSlideData.id}`)}
                                        className="px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold rounded-full transition-all hover:bg-white/20 cursor-pointer"
                                    >
                                        View Details
                                    </button>
                                </div>

                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mt-2 sm:mt-3 md:mt-4 lg:mt-6">
                                    by {currentSlideData.seller}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center h-full max-w-2xl">
                                {/* AI Badge - Responsive */}
                                <div className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/40 rounded-full mb-2 sm:mb-4 md:mb-6 w-fit">
                                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-cyan-300 uppercase tracking-wider">AI-Powered</span>
                                </div>

                                <div>
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-white mb-1 sm:mb-2 md:mb-3 tracking-tight">
                                        {currentSlideData.title}
                                    </h1>
                                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-medium">
                                        {currentSlideData.subtitle}
                                    </p>
                                </div>

                                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 leading-relaxed max-w-xl my-3 sm:my-4 md:my-6 lg:my-8">
                                    {currentSlideData.description}
                                </p>

                                <button
                                    onClick={onAIChatClick}
                                    className="px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all flex items-center gap-2 lg:gap-3 w-fit cursor-pointer"
                                >
                                    <MessageCircle size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    {currentSlideData.ctaText}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls - Fully responsive */}
            <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 z-10">
                {/* Prev Button */}
                <button
                    onClick={handlePrev}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/20 cursor-pointer"
                >
                    <ChevronLeft size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/20 cursor-pointer"
                >
                    {isPlaying ? <Pause size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" /> : <Play size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />}
                </button>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/20 cursor-pointer"
                >
                    <ChevronRight size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </button>
            </div>

            {/* Slide Indicators - Responsive */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 flex items-center gap-1 sm:gap-1.5 md:gap-2 z-10">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1 sm:h-1.5 md:h-2 rounded-full transition-all cursor-pointer ${idx === currentSlide
                            ? 'w-4 sm:w-6 md:w-8 bg-white'
                            : 'w-1 sm:w-1.5 md:w-2 bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default PulseCarousel;
