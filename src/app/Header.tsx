import * as React from 'react';
import UserDropdown from './components/UserDropdown';

const goldGradientStyle: React.CSSProperties = {
    background: 'linear-gradient(to bottom, #FFF5D9 0%, #EECB6C 20%, #C8A560 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    // textFillColor: 'transparent',
    textShadow: '0px 0px 1px rgba(200, 165, 96, 0.2)',
    fontWeight: '700',
    letterSpacing: '0.05em',
};

export default function Header() {
    return (
        <header className="bg-slate-800 shadow-md border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <img
                        className="h-auto rounded-full size-10 shadow-md"
                        src="/AxisLogo.jpg"
                        alt="AxisLogo"
                    />
                    <h1 className="text-2xl" style={{ ...goldGradientStyle, fontFamily: "'Goldman', sans-serif" }}>AXIS SPONSORS HUB</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <UserDropdown />
                </div>
            </div>
        </header>
    )
}