import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'gold' | 'white' | 'blue';
}

export default function LoadingSpinner({ size = 'md', color = 'gold' }: LoadingSpinnerProps) {
    // Size mappings
    const sizeMap = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    // Color mappings
    const colorMap = {
        gold: 'border-[#C8A560]',
        white: 'border-white',
        blue: 'border-blue-500'
    };

    return (
        <div className="flex justify-center items-center py-8">
            <div className={`animate-spin rounded-full ${sizeMap[size]} border-t-2 border-b-2 ${colorMap[color]}`}></div>
        </div>
    );
}