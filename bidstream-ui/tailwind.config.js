/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bidstream: {
                    blue: '#3357FF',
                    dark: '#2c3e50',
                    accent: '#FF5733',
                }
            }
        },
    },
    plugins: [],
}