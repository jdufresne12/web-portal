"use client";

import { useState, useRef, useEffect } from "react";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="flex items-center border-2 bg-slate-900 border-slate-200 text-slate-200 rounded-full p-1 hover:bg-slate-700 hover:border-[#C8A560] hover:text-[#C8A560] transition duration-200 ease-in-out cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FiUser className="text-2xl" />
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-md shadow-lg z-10 overflow-hidden">
                    <div className="py-1">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:text-[#C8A560] transition duration-150 ease-in-out"
                        >
                            <FiLogOut className="mr-2" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;