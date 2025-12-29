import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean,
    varient?: 'primary' | 'danger'
}

export function Button({ className = "", fullWidth = false, children, varient = 'primary', ...rest }: ButtonProps) {
    return (
        <button
            className={`${fullWidth ? "w-full" : ""} ${varient === "danger" ? "bg-red-500" : "bg-gradient-to-r from-primary to-secondary"} text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}