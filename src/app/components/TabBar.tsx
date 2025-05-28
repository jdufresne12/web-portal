import * as React from 'react';
import { FiList, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { ReactNode } from 'react';

interface TabBarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

interface Tab {
    id: string;
    label: string;
    icon: ReactNode;
}

export default function TabBar({ activeTab, setActiveTab }: TabBarProps) {
    const tabs: Tab[] = [
        { id: 'All', label: 'All Sponsors', icon: <FiList /> },
        { id: 'Active', label: 'Active', icon: <FiCheckCircle /> },
        { id: 'Inactive', label: 'Inactive', icon: <FiXCircle /> }
    ];

    return (
        <div className="flex flex-wrap">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`
                        flex items-center px-4 py-3 text-sm font-medium transition-all duration-100 hover:cursor-pointer
                        ${activeTab === tab.id
                            ? 'text-[#EECB6C] border-b-2 border-[#EECB6C]'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                        }
                    `}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    );
}