import React from 'react';
import {useNavigate, Link} from 'react-router-dom'; // ADDED: Link import
import {useAuth} from '../context/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import CategoryRibbon from '../components/dashboard/CategoryRibbon';
import HeroCarousel from '../components/dashboard/HeroCarousel';
import BidBuddy from '../components/dashboard/BidBuddy';
import {LiveTimer} from '../components/dashboard/LiveTimer';
import {Globe, Mail, Phone} from 'lucide-react';
import OnboardingModal from '../components/onboarding/OnboardingModal'; // Ensure path is correct

const HomePage = () => {
    const {user} = useAuth();
    const navigate = useNavigate();

    // Check if the user is authenticated but hasn't picked a role yet
    const isPending = user?.role === 'ROLE_SELECTION_PENDING';

    const handleOnboardingComplete = () => {
        // Once the final slide is clicked, move to the actual dashboard
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans transition-colors duration-500">
            {/* Main content wrapper that blurs when onboarding is active */}
            <div
                className={`flex flex-col min-h-screen transition-all duration-700 ${isPending ? 'blur-xl grayscale pointer-events-none scale-95' : 'blur-0'}`}>
                <header className="sticky top-0 z-[60]">
                    {/* Top Bar */}
                    <div
                        className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 hidden sm:block">
                        <div
                            className="max-w-[1400px] mx-auto px-6 py-2 flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <div className="flex gap-8">
                                <span
                                    className="hover:text-blue-600 cursor-pointer transition-colors">Help & Contact</span>
                                <Link to="/dashboard" className="hover:text-blue-600 cursor-pointer transition-colors">Start
                                    Selling</Link>
                            </div>
                            <div className="flex gap-8">
                                <span>Ship to: <span
                                    className="text-slate-900 dark:text-white">India | ₹ INR</span></span>
                            </div>
                        </div>
                    </div>
                    <DashboardNavbar/>
                    <CategoryRibbon/>
                </header>

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="max-w-[1400px] mx-auto px-0 sm:px-6 pt-0 sm:pt-6">
                        <HeroCarousel onOpenBot={() => {
                        }}/>
                    </section>

                    {/* Live Auctions Section */}
                    <section className="max-w-[1400px] mx-auto px-6 py-24">
                        <div className="flex items-center justify-between mb-16">
                            <h2 className="text-5xl font-black tracking-tighter italic dark:text-white uppercase">LIVE
                                NOW</h2>
                            <div className="h-[2px] flex-1 bg-gray-100 dark:bg-slate-800 mx-10 hidden md:block"/>
                            <button
                                className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline cursor-pointer">
                                View All Active Lots
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            <AuctionCard
                                title="Audemars Piguet Royal Oak"
                                price="₹42,00,000"
                                time={3600}
                                img="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800"
                            />
                            <AuctionCard
                                title="1963 Corvette Sting Ray"
                                price="₹1,15,00,000"
                                time={120}
                                img="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"
                            />
                            <AuctionCard
                                title="Rare Pokémon Illustrator Card"
                                price="₹8,50,000"
                                time={72000}
                                img="https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=800"
                            />
                        </div>
                    </section>
                </main>

                <BidBuddy/>

                {/* Footer */}
                <footer
                    className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pt-20 pb-12">
                    <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-2xl font-black mb-6 dark:text-white uppercase">BidStream.</h3>
                            <p className="text-gray-400 font-bold text-sm max-w-sm leading-relaxed">
                                Join the most secure global auction house. From fine art to rare tech, we deliver value
                                at high velocity.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-black text-[10px] uppercase text-gray-400 mb-6 tracking-widest">Support</h4>
                            <ul className="space-y-4 text-sm font-black text-slate-900 dark:text-slate-200">
                                <li className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors">
                                    <Mail size={16}/> help@bidstream.com
                                </li>
                                <li className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors">
                                    <Phone size={16}/> 1800-BID-NOW
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-[10px] uppercase text-gray-400 mb-6 tracking-widest">Platform</h4>
                            <ul className="space-y-4 text-sm font-black text-slate-900 dark:text-slate-200">
                                <li className="cursor-pointer hover:text-blue-600 transition-colors">Terms &
                                    Conditions
                                </li>
                                <li className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2">
                                    <Globe size={16}/> Privacy Policy
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div
                        className="max-w-[1400px] mx-auto px-6 border-t border-gray-200 dark:border-slate-800 pt-10 text-[10px] font-black text-gray-400 text-center tracking-[0.3em]">
                        © 2026 BIDSTREAM AUCTION PLATFORM. WHERE VALUE MEETS VELOCITY.
                    </div>
                </footer>
            </div>

            {/* Modal Layer: Stays sharp while background blurs */}
            <OnboardingModal
                isOpen={isPending}
                userEmail={user?.email}
                onClose={handleOnboardingComplete}
            />
        </div>
    );
};

const AuctionCard = ({title, price, time, img}) => (
    <div className="group cursor-pointer">
        <div
            className="relative h-80 rounded-[2.5rem] overflow-hidden mb-8 shadow-xl transition-all group-hover:-translate-y-2 group-hover:shadow-2xl">
            <img src={img}
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                 alt={title}/>
            <div
                className="absolute top-6 left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"/>
                <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Live</span>
            </div>
        </div>
        <div className="px-4">
            <h3 className="text-2xl font-black mb-4 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tighter italic truncate">{title}</h3>
            <div
                className="flex justify-between items-center bg-gray-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-transparent dark:border-slate-800">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Current Bid</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{price}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-red-400 uppercase mb-1">Ends In</p>
                    <LiveTimer initialSeconds={time}/>
                </div>
            </div>
        </div>
    </div>
);

export default HomePage;