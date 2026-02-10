const Button = ({ children, variant = "primary", className = "", disabled, ...props }) => {
    const baseStyles = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "text-white bg-bidstream-blue hover:bg-blue-700 focus:ring-bidstream-blue",
        outline: "text-bidstream-dark bg-white border-gray-300 hover:bg-gray-50 focus:ring-bidstream-blue",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;