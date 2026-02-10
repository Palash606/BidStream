import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Sparkles, Gavel, MessageSquare, Play, Pause, ChevronLeft, ChevronRight} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

const slides = [
    {
        id: '1',
        title: "SAMSUNG S24 ULTRA",
        subtitle: "Prototype Hardware",
        desc: "Rare testing unit with MAANG-certified hardware. Includes global warranty.",
        price: "₹1,24,000",
        img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2000",
        cta: "BID NOW",
        type: "product"
    },
    {
        id: 'buddy',
        title: "MEET BIDBUDDY AI",
        subtitle: "Neural Auction Assistant",
        desc: "Predict winning bids and scout rare lots with 98% accuracy. Try our new assistant now.",
        img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000",
        cta: "TRY CHATBOT",
        type: "marketing"
    },
    {
        id: '2',
        title: "ROLEX SUBMARINER",
        subtitle: "Vintage 1968 Edition",
        desc: "Museum condition. Fully authenticated with original box and papers.",
        price: "₹18,50,000",
        img: "https://images.unsplash.com/photo-1547996160-81dfa63595dd?q=80&w=2000",
        cta: "BID NOW",
        type: "product"
    },
    {
        id: '3',
        title: "PORSCHE 911 GT3",
        subtitle: "Zero Track Miles",
        desc: "Collector's specification in Shark Blue. Immediate global delivery.",
        price: "₹2,85,00,000",
        img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000",
        cta: "BID NOW",
        type: "product"
    }
];

const HeroCarousel = ({onOpenBot}) => {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(() => setIndex(prev => (prev + 1) % slides.length), 7000);
        return () => clearInterval(timer);
    }, [paused, slides.length]);

    return (
        <div
            className="group relative h-[550px] w-full bg-bidstream-dark dark:bg-black overflow-hidden rounded-[3rem] shadow-2xl border border-white/5 mx-auto transition-all">
            <AnimatePresence mode="wait">
                <motion.div key={index} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                            transition={{duration: 0.8}} className="absolute inset-0 flex flex-col md:flex-row">
                    <div className="w-full md:w-3/5 h-full relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-bidstream-dark dark:from-black via-transparent to-transparent z-10"/>
                        <img src={slides[index].img}
                             className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                             alt="Carousel"/>
                    </div>
                    <div className="w-full md:w-2/5 p-12 flex flex-col justify-center z-20">
                        <motion.div initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}}
                                    transition={{delay: 0.2}}>
                            {slides[index].type === 'marketing' && <span
                                className="bg-bidstream-blue/20 text-bidstream-blue px-3 py-1 rounded-full text-[10px] font-black uppercase mb-6 inline-flex items-center gap-2 border border-bidstream-blue/20"><Sparkles
                                size={12}/> NEW TECH</span>}
                            <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase italic">{slides[index].title}</h2>
                            <p className="text-bidstream-blue font-black text-lg mb-8 uppercase tracking-widest">{slides[index].subtitle}</p>
                            {slides[index].type === 'product' && <div
                                className="bg-white/5 border border-white/10 p-5 rounded-3xl mb-8 backdrop-blur-md w-fit">
                                <p className="text-[10px] text-gray-400 font-black mb-1">Starting Price</p><p
                                className="text-3xl font-black text-white">{slides[index].price}</p></div>}
                            <p className="text-gray-400 mb-10 text-sm font-bold max-w-sm">{slides[index].desc}</p>
                            <button
                                onClick={() => slides[index].type === 'marketing' ? onOpenBot() : navigate(`/product/${slides[index].id}`)}
                                className="bg-white text-bidstream-dark px-10 py-5 rounded-full font-black text-sm flex items-center gap-3 hover:bg-bidstream-blue hover:text-white transition-all transform active:scale-95 cursor-pointer shadow-xl">{slides[index].type === 'product' ?
                                <Gavel size={18}/> : <MessageSquare size={18}/>} {slides[index].cta}</button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls Bar */}
            <div
                className="absolute bottom-10 left-12 flex items-center gap-4 z-30 bg-black/30 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPaused(!paused)}
                        className="text-white/60 hover:text-white cursor-pointer transition-colors">{paused ?
                    <Play size={16}/> : <Pause size={16}/>}</button>
                <div className="w-[1px] h-4 bg-white/20"/>
                <div className="flex gap-3">
                    {slides.map((_, i) => (<button key={i} onClick={() => setIndex(i)}
                                                   className={`h-1 transition-all rounded-full ${i === index ? 'w-10 bg-bidstream-blue' : 'w-2 bg-white/20'}`}/>))}
                </div>
            </div>
        </div>
    );
};

export default HeroCarousel;