import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, Check,
    Package, Tag, Gavel, ImagePlus,
    Search, Plus, X, Upload, Camera,
    Clock, Hammer, AlertCircle, Info,
    ChevronDown, Loader2, ZoomIn
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const INITIAL_CATEGORIES = [
    'Luxury Watches',
    'Rare Collectibles',
    'Fine Art & Paintings',
    'Electronics & Gadgets',
    'Antique Furniture',
    'Vintage Jewellery',
    'Classic Automobiles',
    'Sports Memorabilia',
    'Rare Coins & Currency',
    'Designer Fashion',
    'Musical Instruments',
    'Books & Manuscripts',
];

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGES = 8;

const STEPS = [
    { id: 1, label: 'Basic Info',      icon: Package },
    { id: 2, label: 'Details',         icon: Tag      },
    { id: 3, label: 'Auction Setup',   icon: Gavel    },
    { id: 4, label: 'Images',          icon: ImagePlus },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

const isMobileDevice = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Glassmorphism input */
const GlassInput = ({ label, hint, error, required, children }) => (
    <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wide">
                {label}{required && <span className="text-indigo-400 ml-0.5">*</span>}
            </label>
            {hint && (
                <span className="group relative cursor-help">
                    <Info size={11} className="text-slate-500" />
                    <span className="absolute left-5 top-0 w-48 bg-slate-800 border border-white/10 text-[10px] text-slate-300 px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-none leading-relaxed">
                        {hint}
                    </span>
                </span>
            )}
        </div>
        {children}
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1 text-[11px] text-rose-400 font-medium"
                >
                    <AlertCircle size={10} /> {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

const inputClass = `
    w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
    text-sm text-white placeholder-slate-500
    focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 focus:ring-1 focus:ring-indigo-500/30
    transition-all duration-200
`.trim();

const errorInputClass = `
    w-full bg-rose-500/5 border border-rose-500/30 rounded-xl px-4 py-3
    text-sm text-white placeholder-slate-500
    focus:outline-none focus:border-rose-400/60 focus:ring-1 focus:ring-rose-400/20
    transition-all duration-200
`.trim();

/** Horizontal stepper */
const Stepper = ({ currentStep }) => (
    <div className="w-full flex items-center justify-center mb-10">
        {STEPS.map((step, idx) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            const Icon = step.icon;
            return (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1.5">
                        <motion.div
                            animate={{
                                backgroundColor: done ? 'rgba(99,102,241,0.9)' : active ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                                borderColor: done || active ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.1)',
                                scale: active ? 1.08 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                            className="w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg"
                            style={{ boxShadow: active ? '0 0 20px rgba(99,102,241,0.4)' : 'none' }}
                        >
                            {done
                                ? <Check size={16} className="text-white" strokeWidth={3} />
                                : <Icon size={15} className={active ? 'text-indigo-300' : 'text-slate-600'} />
                            }
                        </motion.div>
                        <span className={`text-[10px] font-bold tracking-wide hidden sm:block transition-colors ${
                            active ? 'text-indigo-300' : done ? 'text-indigo-400/70' : 'text-slate-600'
                        }`}>
                            {step.label}
                        </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <div className="flex-1 mx-2 sm:mx-3 h-px relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/8" />
                            <motion.div
                                animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                                initial={{ scaleX: 0 }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                style={{ originX: 0 }}
                                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-400"
                            />
                        </div>
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

/** Category dropdown with search */
const CategoryDropdown = ({ value, onChange, categories, onAddCategory, error }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [addingNew, setAddingNew] = useState(false);
    const [newCat, setNewCat] = useState('');
    const ref = useRef(null);

    const filtered = categories.filter(c => c.toLowerCase().includes(search.toLowerCase()));

    const handleBlur = useCallback((e) => {
        if (!ref.current?.contains(e.relatedTarget)) {
            setTimeout(() => { setOpen(false); setSearch(''); }, 150);
        }
    }, []);

    const handleSelect = (cat) => {
        onChange(cat);
        setOpen(false);
        setSearch('');
    };

    const handleAddNew = () => {
        const trimmed = newCat.trim();
        if (trimmed && !categories.includes(trimmed)) {
            onAddCategory(trimmed);
            onChange(trimmed);
        }
        setNewCat('');
        setAddingNew(false);
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative" onBlur={handleBlur}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`${value ? inputClass : (error ? errorInputClass : inputClass)} flex items-center justify-between text-left ${!value ? 'text-slate-500' : ''}`}
            >
                <span>{value || 'Select a category'}</span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={15} className="text-slate-500" />
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute z-50 mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Search bar */}
                        <div className="p-2 border-b border-white/5">
                            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                                <Search size={13} className="text-slate-500 flex-shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search categories…"
                                    className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
                                />
                                {search && (
                                    <button onClick={() => setSearch('')}><X size={12} className="text-slate-500 hover:text-white" /></button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-52 overflow-y-auto py-1 custom-scroll">
                            {filtered.length > 0 ? (
                                filtered.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleSelect(cat)}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-indigo-500/15 hover:text-white ${
                                            value === cat ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-xs text-slate-500 text-center">No categories found</div>
                            )}
                        </div>

                        {/* Add new */}
                        <div className="border-t border-white/5 p-2">
                            {!addingNew ? (
                                <button
                                    type="button"
                                    onClick={() => setAddingNew(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                                >
                                    <Plus size={14} /> Add new category
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newCat}
                                        onChange={e => setNewCat(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddNew()}
                                        placeholder="New category name…"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
                                    />
                                    <button type="button" onClick={handleAddNew}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors">
                                        Add
                                    </button>
                                    <button type="button" onClick={() => { setAddingNew(false); setNewCat(''); }}
                                        className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-xs rounded-xl transition-colors">
                                        <X size={13} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/** Image preview card */
const ImageCard = ({ file, url, onRemove, index }) => {
    const [zoomed, setZoomed] = useState(false);
    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5"
            >
                <img src={url} alt={file.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setZoomed(true)}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
                        <ZoomIn size={14} />
                    </button>
                    <button type="button" onClick={() => onRemove(index)}
                        className="p-1.5 bg-rose-500/70 hover:bg-rose-500 rounded-lg text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>
                {index === 0 && (
                    <span className="absolute top-2 left-2 bg-indigo-600/90 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Cover
                    </span>
                )}
                <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/60 text-[9px] text-slate-400 truncate">
                    {file.name}
                </div>
            </motion.div>

            {/* Lightbox */}
            <AnimatePresence>
                {zoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomed(false)}
                        className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-6 cursor-zoom-out"
                    >
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={url} alt={file.name}
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        />
                        <button onClick={() => setZoomed(false)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white">
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ─── Step Forms ───────────────────────────────────────────────────────────────

const Step1BasicInfo = ({ data, onChange, errors, categories, setCategories }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-black text-white tracking-tight">Product Information</h2>
            <p className="text-xs text-slate-500 mt-1">Start with the basics. Give your lot a compelling identity.</p>
        </div>
        <GlassInput label="Product Name" required error={errors.name}>
            <input
                type="text"
                value={data.name}
                onChange={e => onChange('name', e.target.value)}
                placeholder="e.g. Vintage Omega Chronograph 1968"
                className={errors.name ? errorInputClass : inputClass}
                maxLength={120}
            />
        </GlassInput>
        <GlassInput label="Description" required error={errors.description}
            hint="Describe the item's condition, provenance, and unique characteristics.">
            <textarea
                rows={4}
                value={data.description}
                onChange={e => onChange('description', e.target.value)}
                placeholder="Provide a detailed, honest description. Mention condition, age, rarity, and any certificates of authenticity…"
                className={`${errors.description ? errorInputClass : inputClass} resize-none leading-relaxed`}
                maxLength={1500}
            />
            <p className="text-right text-[10px] text-slate-600">{data.description.length}/1500</p>
        </GlassInput>
        <GlassInput label="Category" required error={errors.category}>
            <CategoryDropdown
                value={data.category}
                onChange={v => onChange('category', v)}
                categories={categories}
                onAddCategory={cat => setCategories(prev => [...prev, cat])}
                error={errors.category}
            />
        </GlassInput>
    </div>
);

const Step2Details = ({ data, onChange, errors }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-black text-white tracking-tight">Product Details</h2>
            <p className="text-xs text-slate-500 mt-1">Specifications help buyers make confident bids.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <GlassInput label="Starting Bid (₹)" required error={errors.initialPrice}
                hint="The minimum opening bid amount in Indian Rupees.">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                    <input
                        type="number"
                        min="1"
                        value={data.initialPrice}
                        onChange={e => onChange('initialPrice', e.target.value)}
                        placeholder="0"
                        className={`${errors.initialPrice ? errorInputClass : inputClass} pl-8`}
                    />
                </div>
            </GlassInput>
            <GlassInput label="Weight" error={errors.weight} hint="e.g. 250g, 1.2kg">
                <input
                    type="text"
                    value={data.weight}
                    onChange={e => onChange('weight', e.target.value)}
                    placeholder="e.g. 250g"
                    className={errors.weight ? errorInputClass : inputClass}
                />
            </GlassInput>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <GlassInput label="Dimensions" error={errors.dimensions} hint="L × W × H, e.g. 30cm × 20cm × 10cm">
                <input
                    type="text"
                    value={data.dimensions}
                    onChange={e => onChange('dimensions', e.target.value)}
                    placeholder="e.g. 30cm × 20cm × 10cm"
                    className={errors.dimensions ? errorInputClass : inputClass}
                />
            </GlassInput>
            <GlassInput label="Manufacturer / Brand" error={errors.manufacturer}>
                <input
                    type="text"
                    value={data.manufacturer}
                    onChange={e => onChange('manufacturer', e.target.value)}
                    placeholder="e.g. Omega, Rolex, Christie's"
                    className={errors.manufacturer ? errorInputClass : inputClass}
                />
            </GlassInput>
        </div>
    </div>
);

/** End time picker — min captured once at component mount via lazy useState */
const EndTimeInput = ({ data, onChange, errors }) => {
    const [minDateTime] = useState(() =>
        new Date(Date.now() + 3600000).toISOString().slice(0, 16)
    );
    return (
        <GlassInput label="Auction End Date & Time" required error={errors.auctionEndTime}
            hint="Must be at least 1 hour from now. All times are in IST.">
            <input
                type="datetime-local"
                value={data.auctionEndTime}
                onChange={e => onChange('auctionEndTime', e.target.value)}
                min={minDateTime}
                className={`${errors.auctionEndTime ? errorInputClass : inputClass} [color-scheme:dark]`}
            />
        </GlassInput>
    );
};

const Step3AuctionSetup = ({ data, onChange, errors }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-black text-white tracking-tight">Auction Setup</h2>
            <p className="text-xs text-slate-500 mt-1">Choose how your auction will conclude.</p>
        </div>

        <GlassInput label="Auction Type" required error={errors.auctionType}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                {/* 3-Hammer Bid */}
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChange('auctionType', 'THREE_HAMMER')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                        data.auctionType === 'THREE_HAMMER'
                            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                            : 'border-white/10 bg-white/3 hover:border-white/20'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${data.auctionType === 'THREE_HAMMER' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-500'}`}>
                            <Hammer size={18} />
                        </div>
                        <div>
                            <p className={`font-black text-sm ${data.auctionType === 'THREE_HAMMER' ? 'text-white' : 'text-slate-300'}`}>
                                3-Hammer Bid
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                Auction ends after 3 consecutive bids with no counter. Classic auctioneer style — <em>Going once, going twice, sold!</em>
                            </p>
                        </div>
                    </div>
                    {data.auctionType === 'THREE_HAMMER' && (
                        <motion.div
                            layoutId="auction-check"
                            className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
                        >
                            <Check size={11} className="text-white" strokeWidth={3} />
                        </motion.div>
                    )}
                </motion.button>

                {/* Regular End Time */}
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChange('auctionType', 'END_TIME')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                        data.auctionType === 'END_TIME'
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                            : 'border-white/10 bg-white/3 hover:border-white/20'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${data.auctionType === 'END_TIME' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-slate-500'}`}>
                            <Clock size={18} />
                        </div>
                        <div>
                            <p className={`font-black text-sm ${data.auctionType === 'END_TIME' ? 'text-white' : 'text-slate-300'}`}>
                                Scheduled End Time
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                Auction closes at a fixed date and time. Highest bid at closing wins.
                            </p>
                        </div>
                    </div>
                    {data.auctionType === 'END_TIME' && (
                        <motion.div
                            layoutId="auction-check"
                            className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                            <Check size={11} className="text-white" strokeWidth={3} />
                        </motion.div>
                    )}
                </motion.button>
            </div>
        </GlassInput>

        <AnimatePresence>
            {data.auctionType === 'END_TIME' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <EndTimeInput data={data} onChange={onChange} errors={errors} />
                </motion.div>
            )}
        </AnimatePresence>

        {data.auctionType === 'THREE_HAMMER' && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-3"
            >
                <Info size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    In <strong className="text-indigo-300">3-Hammer Bid</strong> mode, the auction closes automatically after the bid receives no counter-bid three consecutive times.
                    No end time is required — the system manages the closure dynamically.
                </p>
            </motion.div>
        )}
    </div>
);

const Step4Images = ({ images, onAdd, onRemove, errors }) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const isMobile = isMobileDevice();

    const validateAndAdd = (files) => {
        const fileArr = Array.from(files);
        return fileArr.map(file => {
            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                return { error: `"${file.name}" is not a supported image format (PNG, JPG, SVG, WEBP, GIF).` };
            }
            if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                return { error: `"${file.name}" exceeds the ${MAX_IMAGE_SIZE_MB}MB size limit.` };
            }
            return { file };
        });
    };

    const handleFiles = (files) => {
        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) return;
        const results = validateAndAdd(Array.from(files).slice(0, remaining));
        onAdd(results);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-white tracking-tight">Product Images</h2>
                <p className="text-xs text-slate-500 mt-1">
                    Add up to {MAX_IMAGES} images. The first image will be the cover. Supported: PNG, JPG, JPEG, SVG, WEBP, GIF.
                </p>
            </div>

            {/* Upload Zone */}
            <motion.div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                animate={{
                    borderColor: dragOver ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.1)',
                    backgroundColor: dragOver ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.02)',
                }}
                className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
                onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
            >
                <motion.div
                    animate={{ y: dragOver ? -6 : 0 }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dragOver ? 'bg-indigo-500/20' : 'bg-white/5'}`}
                >
                    <Upload size={24} className={dragOver ? 'text-indigo-300' : 'text-slate-500'} />
                </motion.div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-slate-300">
                        {dragOver ? 'Drop images here!' : 'Drag & drop images or click to browse'}
                    </p>
                    <p className="text-[11px] text-slate-600">
                        PNG, JPG, JPEG, SVG, WEBP, GIF • Max {MAX_IMAGE_SIZE_MB}MB per image • Up to {MAX_IMAGES} images
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        disabled={images.length >= MAX_IMAGES}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Upload size={13} /> Upload Files
                    </button>
                    {isMobile && (
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                            disabled={images.length >= MAX_IMAGES}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Camera size={13} /> Take Photo
                        </button>
                    )}
                </div>
                {images.length >= MAX_IMAGES && (
                    <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                        <AlertCircle size={11} /> Maximum {MAX_IMAGES} images reached
                    </p>
                )}
            </motion.div>

            {/* Hidden inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
            />

            {/* Errors */}
            <AnimatePresence>
                {errors.images && errors.images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                    >
                        {errors.images.map((err, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                <AlertCircle size={13} className="text-rose-400 flex-shrink-0" />
                                <p className="text-xs text-rose-300">{err}</p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Grid */}
            <AnimatePresence mode="popLayout">
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    >
                        {images.map((img, i) => (
                            <ImageCard key={img.url} file={img.file} url={img.url} onRemove={onRemove} index={i} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {errors.imageRequired && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-xs text-rose-400 font-medium"
                >
                    <AlertCircle size={12} /> {errors.imageRequired}
                </motion.p>
            )}
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AddProductPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([...INITIAL_CATEGORIES]);
    const [submitting, setSubmitting] = useState(false);

    const [basicInfo, setBasicInfo] = useState({ name: '', description: '', category: '' });
    const [details, setDetails] = useState({ initialPrice: '', weight: '', dimensions: '', manufacturer: '' });
    const [auction, setAuction] = useState({ auctionType: '', auctionEndTime: '' });
    const [images, setImages] = useState([]);
    const [imageErrors, setImageErrors] = useState([]);

    const [errors, setErrors] = useState({});

    const updateField = (setter) => (field, value) => {
        setter(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    // Validation per step
    const validate = () => {
        const errs = {};
        if (step === 1) {
            if (!basicInfo.name.trim()) errs.name = 'Product name is required.';
            else if (basicInfo.name.trim().length < 5) errs.name = 'Name must be at least 5 characters.';
            if (!basicInfo.description.trim()) errs.description = 'Description is required.';
            else if (basicInfo.description.trim().length < 20) errs.description = 'Description must be at least 20 characters.';
            if (!basicInfo.category) errs.category = 'Please select a category.';
        }
        if (step === 2) {
            if (!details.initialPrice) errs.initialPrice = 'Starting bid is required.';
            else if (isNaN(Number(details.initialPrice)) || Number(details.initialPrice) <= 0) errs.initialPrice = 'Enter a valid positive amount.';
        }
        if (step === 3) {
            if (!auction.auctionType) errs.auctionType = 'Please select an auction type.';
            if (auction.auctionType === 'END_TIME') {
                if (!auction.auctionEndTime) errs.auctionEndTime = 'End date & time is required for this auction type.';
                else if (new Date(auction.auctionEndTime) <= new Date(Date.now() + 3600000 - 60000)) {
                    errs.auctionEndTime = 'End time must be at least 1 hour from now.';
                }
            }
        }
        if (step === 4) {
            if (images.length === 0) errs.imageRequired = 'Please upload at least one product image.';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            setStep(s => Math.min(s + 1, STEPS.length));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setStep(s => Math.max(s - 1, 1));
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleImageAdd = (results) => {
        const errs = results.filter(r => r.error).map(r => r.error);
        const valid = results.filter(r => r.file).map(r => ({
            file: r.file,
            url: URL.createObjectURL(r.file),
        }));
        setImageErrors(errs);
        if (valid.length) {
            setImages(prev => [...prev, ...valid]);
            setErrors(prev => ({ ...prev, imageRequired: undefined }));
        }
    };

    const handleImageRemove = (index) => {
        setImages(prev => {
            const next = [...prev];
            URL.revokeObjectURL(next[index].url);
            next.splice(index, 1);
            return next;
        });
        setImageErrors([]);
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        // Placeholder — backend integration later
        await new Promise(r => setTimeout(r, 1500));
        setSubmitting(false);
        navigate('/seller');
    };

    const pageVariants = {
        enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
        center: { opacity: 1, x: 0 },
        exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
    };

    const [direction, setDirection] = useState(1);

    const goNext = () => { setDirection(1); handleNext(); };
    const goBack = () => { setDirection(-1); handleBack(); };

    return (
        <div className="min-h-screen bg-[#050510] text-[#a0a0c0] font-sans selection:bg-indigo-500/30">
            {/* Ambient glow blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">

                {/* Back button */}
                <button
                    type="button"
                    onClick={() => navigate('/seller')}
                    className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-semibold transition-colors group mb-8"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">List New Product</h1>
                    <p className="text-xs text-slate-500 mt-1">Complete all steps to publish your lot to the auction marketplace.</p>
                </div>

                {/* Stepper */}
                <Stepper currentStep={step} />

                {/* Glass card */}
                <div className="relative bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 via-transparent to-blue-900/5 pointer-events-none" />

                    <div className="relative z-10 p-6 sm:p-10">
                        {/* Step content with animation */}
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={pageVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                            >
                                {step === 1 && (
                                    <Step1BasicInfo
                                        data={basicInfo}
                                        onChange={updateField(setBasicInfo)}
                                        errors={errors}
                                        categories={categories}
                                        setCategories={setCategories}
                                    />
                                )}
                                {step === 2 && (
                                    <Step2Details
                                        data={details}
                                        onChange={updateField(setDetails)}
                                        errors={errors}
                                    />
                                )}
                                {step === 3 && (
                                    <Step3AuctionSetup
                                        data={auction}
                                        onChange={updateField(setAuction)}
                                        errors={errors}
                                    />
                                )}
                                {step === 4 && (
                                    <Step4Images
                                        images={images}
                                        onAdd={handleImageAdd}
                                        onRemove={handleImageRemove}
                                        errors={{ images: imageErrors, imageRequired: errors.imageRequired }}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                            <button
                                type="button"
                                onClick={goBack}
                                disabled={step === 1}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-sm font-semibold rounded-xl transition-all"
                            >
                                <ArrowLeft size={15} /> Previous
                            </button>

                            <div className="flex items-center gap-2">
                                {STEPS.map(s => (
                                    <div
                                        key={s.id}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            s.id === step ? 'w-6 bg-indigo-500' : s.id < step ? 'w-3 bg-indigo-400/50' : 'w-3 bg-white/10'
                                        }`}
                                    />
                                ))}
                            </div>

                            {step < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                                >
                                    Next <ArrowRight size={15} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    {submitting ? (
                                        <><Loader2 size={15} className="animate-spin" /> Publishing…</>
                                    ) : (
                                        <><Check size={15} /> Publish Listing</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress note */}
                <p className="text-center text-[10px] text-slate-700 mt-6 font-medium">
                    Step {step} of {STEPS.length} • Your progress is saved locally
                </p>
            </div>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
            `}</style>
        </div>
    );
};

export default AddProductPage;
