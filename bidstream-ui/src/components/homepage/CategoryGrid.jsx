import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CategoryGrid - Modern shop by category section with images
 */
const CategoryGrid = () => {
    const categories = [
        {
            label: 'Luxury Cars',
            slug: 'luxury-cars',
            gradient: 'from-red-500 to-orange-500',
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop'
        },
        {
            label: 'Timepieces',
            slug: 'timepieces',
            gradient: 'from-blue-500 to-cyan-500',
            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop'
        },
        {
            label: 'Fine Art',
            slug: 'fine-art',
            gradient: 'from-purple-500 to-pink-500',
            image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&h=400&fit=crop'
        },
        {
            label: 'Electronics',
            slug: 'electronics',
            gradient: 'from-green-500 to-teal-500',
            image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop'
        },
        {
            label: 'Collectibles',
            slug: 'collectibles',
            gradient: 'from-yellow-500 to-amber-500',
            image: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=400&h=400&fit=crop'
        },
        {
            label: 'Fashion',
            slug: 'fashion',
            gradient: 'from-pink-500 to-rose-500',
            image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop'
        },
        {
            label: 'Real Estate',
            slug: 'real-estate',
            gradient: 'from-indigo-500 to-purple-500',
            image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop'
        },
        {
            label: 'Rare Books',
            slug: 'rare-books',
            gradient: 'from-emerald-500 to-green-500',
            image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop'
        }
    ];

    return (
        <section className="py-12 md:py-16 bg-slate-950 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-6">
                {/* Section Header */}
                <div className="mb-6">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                        Shop by Category
                    </h2>
                    <p className="text-gray-400 font-medium">
                        Explore premium auctions across exclusive categories
                    </p>
                </div>

                {/* Category Grid - Modern cards with larger, closer images */}
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
                    {categories.map(({ label, slug, gradient, image }) => (
                        <Link
                            key={slug}
                            to={`/products/categories/${slug}`}
                            className="group flex flex-col items-center gap-3"
                        >
                            {/* Image Circle with Gradient Border - Larger size */}
                            <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${gradient} p-[3px] transition-all group-hover:scale-105 group-hover:shadow-2xl`}>
                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                                    <img
                                        src={image}
                                        alt={label}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                            </div>

                            {/* Label */}
                            <span className="text-xs md:text-sm font-bold text-center text-gray-300 group-hover:text-blue-400 transition-colors leading-tight">
                                {label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
