import React, { useState } from 'react';
import { useAuthStore } from '../stores';
import PublicNavbar from '../components/navbar/PublicNavbar';
import PulseCarousel from '../components/homepage/PulseCarousel';
import CategoryGrid from '../components/homepage/CategoryGrid';
import ProductRow from '../components/homepage/ProductRow';
import ContactSection from '../components/homepage/ContactSection';
import PublicFooter from '../components/footer/PublicFooter';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import BidBuddyModal from '../components/ai/BidBuddyModal';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, Gem, Sparkles, Car, Watch, MessageCircle } from 'lucide-react';
import AnimatedFire from '../components/animations/AnimatedFire';
import AnimatedClock from '../components/animations/AnimatedClock';
import AnimatedDiamond from '../components/animations/AnimatedDiamond';
import AnimatedSparkle from '../components/animations/AnimatedSparkle';
import AnimatedCar from '../components/animations/AnimatedCar';
import AnimatedWatch from '../components/animations/AnimatedWatch';

/**
 * HomePage - Premium public homepage with world-class aesthetic
 * Features: BidBuddy AI modal, theme system, balanced spacing
 */
const HomePage = () => {
    const user = useAuthStore((state) => state.user);
    const isOnboardingPending = useAuthStore((state) => state.isOnboardingPending());
    const [isBidBuddyOpen, setIsBidBuddyOpen] = useState(false);
    const navigate = useNavigate();

    // Mock product data - Realistic Indian Market Items
    const trendingProducts = [
        {
            id: 1,
            title: '3BHK Luxury Apartment - Bandra West, Mumbai',
            seller: 'PremiumRealty',
            currentBid: '₹4,75,00,000',
            endTime: new Date(Date.now() + 172800000).toISOString(), // 2 days
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
        },
        {
            id: 2,
            title: 'Royal Enfield Bullet 350 Classic (1985)',
            seller: 'VintageRides',
            currentBid: '₹2,85,000',
            endTime: new Date(Date.now() + 86400000).toISOString(), // 1 day
            image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop'
        },
        {
            id: 3,
            title: 'Canon EOS R5 Mirrorless Camera Kit',
            seller: 'TechDeals',
            currentBid: '₹2,15,000',
            endTime: new Date(Date.now() + 43200000).toISOString(), // 12 hours
            image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop'
        },
        {
            id: 4,
            title: 'Tanishq 22K Gold Necklace Set (75g)',
            seller: 'LuxuryJewels',
            currentBid: '₹4,25,000',
            endTime: new Date(Date.now() + 259200000).toISOString(), // 3 days
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop'
        },
        {
            id: 5,
            title: 'Rolex Submariner Date (2021 Model)',
            seller: 'TimelessWatches',
            currentBid: '₹12,50,000',
            endTime: new Date(Date.now() + 604800000).toISOString(), // 1 week
            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop'
        }
    ];

    const endingSoonProducts = [
        {
            id: 6,
            title: 'iPhone 15 Pro Max 512GB (Natural Titanium)',
            seller: 'ApplePremium',
            currentBid: '₹1,45,000',
            endTime: new Date(Date.now() + 1800000).toISOString(), // 30 mins
            image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&h=600&fit=crop'
        },
        {
            id: 7,
            title: 'Harley-Davidson Street 750 (2019)',
            seller: 'BikeCollective',
            currentBid: '₹3,85,000',
            endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour
            image: 'https://images.unsplash.com/photo-1558981000-f294a6ed32b2?w=800&h=600&fit=crop'
        },
        {
            id: 8,
            title: 'MacBook Pro M3 Max 16" (1TB)',
            seller: 'TechHub',
            currentBid: '₹2,95,000',
            endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop'
        },
        {
            id: 9,
            title: 'Antique Tanjore Painting (18th Century)',
            seller: 'HeritageArts',
            currentBid: '₹8,50,000',
            endTime: new Date(Date.now() + 10800000).toISOString(), // 3 hours
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'
        }
    ];

    const highValueProducts = [
        {
            id: 10,
            title: '3BHK Penthouse Mumbai',
            seller: 'PrimeRealty',
            currentBid: '₹8,50,00,000',
            timeRemaining: 259200,
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
        },
        {
            id: 11,
            title: 'Patek Philippe Nautilus',
            seller: 'EliteTimepieces',
            currentBid: '₹95,00,000',
            timeRemaining: 43200,
            image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&h=600&fit=crop'
        },
        {
            id: 12,
            title: 'Ducati Panigale V4 S',
            seller: 'SuperbikeDeals',
            currentBid: '₹28,50,000',
            timeRemaining: 14400,
            image: 'https://images.unsplash.com/photo-1558981000-f294a6ed32b2?w=800&h=600&fit=crop'
        }
    ];

    const newListingsProducts = [
        {
            id: 13,
            title: 'Herman Miller Aeron Chair',
            seller: 'OfficeEssentials',
            currentBid: '₹85,000',
            timeRemaining: 172800,
            image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=600&fit=crop'
        },
        {
            id: 14,
            title: 'Rare Pokémon Card Collection',
            seller: 'CollectorHub',
            currentBid: '₹5,50,000',
            timeRemaining: 86400,
            image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=800&h=600&fit=crop'
        }
    ];

    const handleOnboardingComplete = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Public Navigation */}
            <PublicNavbar />

            {/* Hero Carousel */}
            <PulseCarousel onAIChatClick={() => setIsBidBuddyOpen(true)} />

            {/* Shop by Category */}
            <div className="mt-2 sm:mt-4 md:mt-6 lg:mt-8">
                <CategoryGrid />
            </div>

            {/* Product Rows with Balanced Spacing */}
            <ProductRow
                title="Trending Now"
                products={trendingProducts}
                icon={Flame}
                animatedIcon={AnimatedFire}
            />

            <ProductRow
                title="Ending Soon"
                products={endingSoonProducts}
                icon={Clock}
                animatedIcon={AnimatedClock}
            />

            <ProductRow
                title="High-Value Auctions"
                products={highValueProducts}
                icon={Gem}
                animatedIcon={AnimatedDiamond}
            />

            <ProductRow
                title="New Listings"
                products={newListingsProducts}
                icon={Sparkles}
                animatedIcon={AnimatedSparkle}
            />

            <ProductRow
                title="Luxury Cars"
                products={trendingProducts.filter((_, idx) => idx % 2 === 0)}
                icon={Car}
                animatedIcon={AnimatedCar}
            />

            <ProductRow
                title="Timepieces"
                products={trendingProducts.filter((_, idx) => idx % 2 === 1)}
                icon={Watch}
                animatedIcon={AnimatedWatch}
            />

            {/* Separator Line */}
            <div className="border-t border-slate-200 dark:border-slate-800 my-6 max-w-[1400px] mx-auto w-full opacity-60" />

            {/* Contact Us Section - Theme Aware */}
            <ContactSection />

            {/* Footer */}
            <PublicFooter />

            {/* Onboarding Modal - Only for authenticated users with pending role */}
            {user && isOnboardingPending && (
                <OnboardingModal
                    isOpen={true}
                    onClose={handleOnboardingComplete}
                />
            )}

            {/* BidBuddy AI Modal */}
            <BidBuddyModal
                isOpen={isBidBuddyOpen}
                onClose={() => setIsBidBuddyOpen(false)}
            />

            {/* Fixed Pulsing AI Chat Button - Bottom Right */}
            <button
                onClick={() => setIsBidBuddyOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-110 animate-pulse-slow"
                aria-label="Open BidBuddy AI Chat"
            >
                <MessageCircle size={28} className="text-white" />
            </button>
        </div>
    );
};

export default HomePage;