import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: ReactNode;
    className?: string;
}

export default function ActionButton({
    children,
    variant = 'primary',
    icon = null,
    onClick,
    disabled = false,
    className = '',
    ...rest
}: ActionButtonProps) {
    // Style variants
    const variantStyles = {
        primary: 'bg-gradient-to-r from-[#EECB6C] to-[#C8A560] hover:from-[#C8A560] hover:to-[#B89550] text-slate-900',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
        danger: 'bg-red-500/70 hover:bg-red-600/70 text-white',
    };

    const buttonStyle = variantStyles[variant] || variantStyles.primary;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        font-semibold py-2 px-6 rounded-md 
        flex items-center justify-center
        transition-all duration-200 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'} 
        shadow-lg ${buttonStyle} ${className}
      `}
            {...rest}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
}