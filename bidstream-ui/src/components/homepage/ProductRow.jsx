import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import LiveTimer from '../dashboard/LiveTimer';
import { useAuthStore } from '../../stores';

/**
 * ProductCard - Robust responsive card with guaranteed visibility of all elements
 */
const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleBidClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate(`/product/${product.id}`);
        }
    };

    const handleWishlistClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            setIsWishlisted(!isWishlisted);
        }
    };

    return (
        <div
            onClick={handleBidClick}
            className="group flex-shrink-0 relative w-56 sm:w-72 md:w-80 lg:w-96 bg-slate-800 rounded-xl md:rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-slate-700 shadow-lg hover:shadow-2xl cursor-pointer flex flex-col snap-start"
        >
            {/* Image Section - Fixed Height scaling */}
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-slate-900">
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                {/* Live Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-red-500/90 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-sm z-10">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">Live</span>
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistClick();
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-md hover:bg-black/40 rounded-full flex items-center justify-center transition-all z-10 group/btn"
                >
                    <Heart
                        size={16}
                        className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white group-hover/btn:text-red-400'}`}
                    />
                </button>
            </div>

            {/* Content Section - Flex Col to fill space */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3 sm:gap-4">
                {/* Title & Author */}
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors mb-1">
                        {product.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium">
                        by <span className="text-gray-300">{product.seller}</span>
                    </p>
                </div>

                {/* Price & Timer Grid */}
                <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-700/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-0.5">Current Bid</span>
                        <span className="text-lg sm:text-xl font-black text-white tracking-tight">{product.currentBid}</span>
                    </div>
                    <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] uppercase text-red-400 font-bold tracking-wider mb-0.5">Ending In</span>
                        <LiveTimer
                            endTime={product.endTime}
                            className="text-lg sm:text-xl font-black text-white tracking-tight"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleBidClick();
                    }}
                    className="w-full mt-auto py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg sm:rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-blue-500/20"
                >
                    Place Bid
                </button>
            </div>
        </div>
    );
};

/**
 * ProductRow - Horizontal scrollable row of product cards with animated section icons
 */
const ProductRow = ({ title, products, icon: Icon, animatedIcon: AnimatedIcon }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 336; // card width + gap
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-6 bg-slate-950 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-6">
                {/* Section Header with Animated Icon */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        {/* Use AnimatedIcon if provided, otherwise fall back to Icon */}
                        {AnimatedIcon ? <AnimatedIcon /> : (Icon && <Icon size={32} className="text-blue-600" />)}
                        <h2 className="text-3xl font-black text-white tracking-tight">
                            {title}
                        </h2>
                    </div>

                    {/* Navigation Arrows - Always visible, responsive sizing */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-gray-300" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <ChevronRight size={16} className="sm:w-5 sm:h-5 text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll on ALL devices - Responsive cards */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductRow;
