import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden ${className}`}>
            <div>
                {children}
            </div>
        </div>
    );
}