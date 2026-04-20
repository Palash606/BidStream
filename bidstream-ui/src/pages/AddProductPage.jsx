import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, Check,
    Package, Tag, Gavel, ImagePlus,
    Search, Plus, X, Upload, Camera,
    Clock, Hammer, AlertCircle, Info,
    ChevronDown, Loader2, ZoomIn
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../api/product';
import api from '../api/axios';

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGES = 8;

const STEPS = [
    { id: 1, label: 'Basic Info',      icon: Package },
    { id: 2, label: 'Details',         icon: Tag      },
    { id: 3, label: 'Auction Setup',   icon: Gavel    },
    { id: 4, label: 'Images (+)',      icon: ImagePlus },
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
const CategoryDropdown = ({ value, onChange, categories, error }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    const filtered = categories
        .filter(c => c.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const aIsOther = a.toLowerCase().includes('other');
            const bIsOther = b.toLowerCase().includes('other');
            if (aIsOther && !bIsOther) return 1;
            if (!aIsOther && bIsOther) return -1;
            return a.localeCompare(b);
        });

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

    return (
        <div ref={ref} className="relative" onBlur={handleBlur} tabIndex={-1}>
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
                            {categories.length === 0 ? (
                                <div className="px-4 py-3 text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Loading categories...
                                </div>
                            ) : filtered.length > 0 ? (
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const getProductImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:8082${cleanPath}`;
};

/** Image preview card */
const ImageCard = ({ file, url, onRemove, index, isExisting }) => {
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
                <img src={url} alt={file?.name || "Product"} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setZoomed(true)}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
                        <ZoomIn size={14} />
                    </button>
                    {!isExisting && (
                        <button type="button" onClick={() => onRemove(index)}
                            className="p-1.5 bg-rose-500/70 hover:bg-rose-500 rounded-lg text-white transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>
                {index === 0 && (
                    <span className="absolute top-2 left-2 bg-indigo-600/90 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Cover
                    </span>
                )}
                {isExisting && (
                    <span className="absolute bottom-2 right-2 bg-emerald-600/90 text-[8px] font-black text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Saved
                    </span>
                )}
                <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/60 text-[9px] text-slate-500 truncate">
                    {file?.name || "Existing Image"}
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
                            src={url} alt="Zoomed"
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

const Step1BasicInfo = ({ data, onChange, errors, categories }) => (
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
            <GlassInput label="Weight (in grams)" error={errors.weight} hint="e.g. 250g, 550">
                <input
                    type="text"
                    value={data.weight}
                    onChange={e => onChange('weight', e.target.value)}
                    placeholder="e.g. 55"
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

const Step3AuctionSetup = ({ data, onChange, errors, isEdit }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-black text-white tracking-tight">Auction Setup</h2>
            <p className="text-xs text-slate-500 mt-1">{isEdit ? 'Auction type is locked for existing listings.' : 'Choose how your auction will conclude.'}</p>
        </div>

        {isEdit && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                <Info size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-amber-300">Note:</strong> You can only update the end time for scheduled auctions. The base auction style ({data.auctionType}) cannot be changed.
                </p>
            </div>
        )}

        <GlassInput label="Auction Type" required error={errors.auctionType}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                {/* 3-Hammer Bid */}
                <motion.button
                    type="button"
                    disabled={isEdit}
                    whileHover={!isEdit ? { scale: 1.02 } : {}}
                    whileTap={!isEdit ? { scale: 0.98 } : {}}
                    onClick={() => !isEdit && onChange('auctionType', 'THREE_HAMMER')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                        data.auctionType === 'THREE_HAMMER'
                            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                            : 'border-white/10 bg-white/3 hover:border-white/20'
                    } ${isEdit && data.auctionType !== 'THREE_HAMMER' ? 'opacity-40' : ''}`}
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
                                Auction ends after 3 consecutive bids with no counter.
                            </p>
                        </div>
                    </div>
                </motion.button>

                {/* Regular End Time */}
                <motion.button
                    type="button"
                    disabled={isEdit}
                    whileHover={!isEdit ? { scale: 1.02 } : {}}
                    whileTap={!isEdit ? { scale: 0.98 } : {}}
                    onClick={() => !isEdit && onChange('auctionType', 'END_TIME')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                        data.auctionType === 'END_TIME'
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                            : 'border-white/10 bg-white/3 hover:border-white/20'
                    } ${isEdit && data.auctionType !== 'END_TIME' ? 'opacity-40' : ''}`}
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
                                Auction closes at a fixed date and time.
                            </p>
                        </div>
                    </div>
                </motion.button>
            </div>
        </GlassInput>

        <AnimatePresence>
            {data.auctionType === 'END_TIME' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <EndTimeInput data={data} onChange={onChange} errors={errors} />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const Step4Images = ({ images, existingImages, onAdd, onRemove, errors, isEdit }) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const isMobile = isMobileDevice();

    const handleFiles = (files) => {
        const remaining = MAX_IMAGES - (images.length + existingImages.length);
        if (remaining <= 0) return;
        const fileArr = Array.from(files).slice(0, remaining).map(file => ({ file, url: URL.createObjectURL(file) }));
        onAdd(fileArr);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-white tracking-tight">Product Images</h2>
                <p className="text-xs text-slate-500 mt-1">
                    Add new images to your listing. {isEdit ? 'Existing images are saved below.' : ''}
                </p>
            </div>

            <motion.div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                animate={{ borderColor: dragOver ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.1)' }}
                className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer bg-white/[0.02]"
                onClick={() => (images.length + existingImages.length) < MAX_IMAGES && fileInputRef.current?.click()}
            >
                <Upload size={24} className="text-slate-500" />
                <p className="text-sm font-semibold text-slate-300">Click to upload new images</p>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existingImages.map((url, i) => (
                    <ImageCard key={`existing-${i}`} url={getProductImageUrl(url)} isExisting index={i} />
                ))}
                {images.map((img, i) => (
                    <ImageCard key={img.url} file={img.file} url={img.url} onRemove={onRemove} index={i} />
                ))}
            </div>
            {errors.imageRequired && <p className="text-xs text-rose-400">{errors.imageRequired}</p>}
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AddProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    const [basicInfo, setBasicInfo] = useState({ name: '', description: '', category: '' });
    const [details, setDetails] = useState({ initialPrice: '', weight: '', dimensions: '', manufacturer: '' });
    const [auction, setAuction] = useState({ auctionType: '', auctionEndTime: '' });
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const catsRes = await api.get('/api/categories');
                setCategories(catsRes.data.map(c => c.name));

                if (isEdit) {
                    const product = await productAPI.getProduct(id);
                    setBasicInfo({ name: product.name, description: product.description, category: product.categoryName });
                    setDetails({ initialPrice: product.initialPrice, weight: product.weight || '', dimensions: product.dimensions || '', manufacturer: product.manufacturer || '' });
                    setAuction({ auctionType: product.auctionType, auctionEndTime: product.auctionEndTime ? product.auctionEndTime.slice(0, 16) : '' });
                    setExistingImages(product.imageUrls || []);
                }
            } catch (err) {
                toast.error(isEdit ? "Failed to load product" : "Failed to load categories");
                if (isEdit) navigate('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, isEdit, navigate]);

    const updateField = (setter) => (field, value) => {
        setter(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const errs = {};
        if (step === 1) {
            if (!basicInfo.name.trim()) errs.name = 'Product name is required.';
            if (!basicInfo.description.trim()) errs.description = 'Description is required.';
            if (!basicInfo.category) errs.category = 'Category is required.';
        }
        if (step === 2) {
            if (!details.initialPrice) errs.initialPrice = 'Starting bid is required.';
        }
        if (step === 3 && !isEdit) {
            if (!auction.auctionType) errs.auctionType = 'Select auction type.';
        }
        if (step === 4 && !isEdit && images.length === 0 && existingImages.length === 0) {
            errs.imageRequired = 'At least one image is required.';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => { if (validate()) setStep(s => Math.min(s + 1, STEPS.length)); };
    const handleBack = () => { setStep(s => Math.max(s - 1, 1)); setErrors({}); };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const productData = {
                name: basicInfo.name,
                description: basicInfo.description,
                categoryName: basicInfo.category,
                initialPrice: Number(details.initialPrice),
                weight: details.weight || null,
                dimensions: details.dimensions,
                manufacturer: details.manufacturer,
                auctionType: auction.auctionType,
                auctionEndTime: auction.auctionEndTime ? new Date(auction.auctionEndTime).toISOString() : null,
            };

            const imageFiles = images.map(img => img.file);
            if (isEdit) {
                await productAPI.updateProduct(id, productData, imageFiles);
                toast.success('Product updated successfully!');
            } else {
                await productAPI.addProduct(productData, imageFiles);
                toast.success('Product listed successfully!');
            }
            navigate('/products');
        } catch (error) {
            toast.error(error?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050510] text-[#a0a0c0] font-sans selection:bg-indigo-500/30">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-semibold mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">{isEdit ? 'Update Product' : 'List New Product'}</h1>
                    <p className="text-xs text-slate-500 mt-1">{isEdit ? 'Modify your listing details.' : 'Complete all steps to publish your lot to the auction marketplace.'}</p>
                </div>

                <Stepper currentStep={step} />

                <div className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            {step === 1 && <Step1BasicInfo data={basicInfo} onChange={updateField(setBasicInfo)} errors={errors} categories={categories} />}
                            {step === 2 && <Step2Details data={details} onChange={updateField(setDetails)} errors={errors} />}
                            {step === 3 && <Step3AuctionSetup data={auction} onChange={updateField(setAuction)} errors={errors} isEdit={isEdit} />}
                            {step === 4 && (
                                <Step4Images 
                                    images={images} 
                                    existingImages={existingImages} 
                                    onAdd={(valid) => setImages(prev => [...prev, ...valid])} 
                                    onRemove={(idx) => setImages(prev => prev.filter((_, i) => i !== idx))} 
                                    errors={errors} 
                                    isEdit={isEdit} 
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                        <button disabled={step === 1} onClick={handleBack} className="px-5 py-2.5 bg-white/5 rounded-xl text-sm font-semibold disabled:opacity-20 text-slate-300">
                            Previous
                        </button>
                        {step < STEPS.length ? (
                            <button onClick={handleNext} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/25">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-emerald-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2">
                                {submitting ? <><Loader2 size={15} className="animate-spin" /> saving…</> : <><Check size={15} /> {isEdit ? 'Save Changes' : 'Publish Listing'}</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProductPage;
