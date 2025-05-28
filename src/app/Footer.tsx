import * as React from 'react';

export default function Footer() {
    return (
        <footer className="bg-slate-800 border-t border-slate-700 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center">
                <p className="text-slate-400 text-sm text-center">© {new Date().getFullYear()} Axis. Internal use only.</p>
            </div>
        </footer>
    )
}