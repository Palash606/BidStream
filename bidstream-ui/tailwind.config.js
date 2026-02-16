/** @type {import('tailwindcss').Config} */
// NOTE: In Tailwind v4, this file is primarily for IDE IntelliSense support
// The actual configuration is in index.css using @theme directive
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Theme extensions are now defined in index.css using @theme
    theme: {
        extend: {},
    },
    plugins: [],
}