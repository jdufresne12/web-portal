import * as React from 'react';
import { FiDatabase, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface StatsCardsProps {
    label: String;
    amount: number;
}

export default function StatsCards({ label, amount }: StatsCardsProps) {
    return (
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 flex items-center">
            <div className="rounded-full bg-slate-700 p-3 mr-4">
                {label === "Total Sponsors"
                    ? <FiDatabase size={24} className="text-[#C8A560]" />
                    : label === "Active Sponsors"
                        ? <FiCheckCircle size={24} className="text-green-500" />
                        : <FiXCircle size={24} className="text-red-500" />
                }

            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium">{label}</p>
                <p className="text-white text-2xl font-bold">{amount}</p>
            </div>
        </div>
    )
}