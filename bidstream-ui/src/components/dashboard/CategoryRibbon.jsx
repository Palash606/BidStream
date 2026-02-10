import React from 'react';

const categories = ['🔥 Ending Soon', 'Luxury Cars', 'Timepieces', 'Art', 'Jewelry', 'Electronics', 'Sneakers', 'Real Estate', 'Antiques', 'Motorsports'];

const CategoryRibbon = () => (
    <div
        className="w-full bg-white dark:bg-bidstream-dark border-b border-gray-100 dark:border-gray-800 py-4 transition-colors">
        <div
            className="mx-auto max-w-[1400px] px-6 flex justify-center items-center gap-12 overflow-x-auto no-scrollbar">
            {categories.map((name, i) => (
                <button
                    key={name}
                    className={`whitespace-nowrap text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-bidstream-blue cursor-pointer ${i === 0 ? 'text-bidstream-blue' : 'text-gray-400 dark:text-gray-500 hover:scale-110'}`}
                >
                    {name}
                </button>
            ))}
        </div>
    </div>
);

export default CategoryRibbon;