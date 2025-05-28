import React, { ReactNode } from 'react';

interface SectionHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function SectionHeader({ title, description, action }: SectionHeaderProps) {
    return (
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-white text-lg font-semibold mb-2">{title}</h2>
                {description && <p className="text-slate-400 text-sm">{description}</p>}
            </div>

            {action && <div>{action}</div>}
        </div>
    );
}