import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiXCircle, FiEdit, FiTrash2 } from 'react-icons/fi';
import LocationBubble from './LocationBubble';
import Link from 'next/link';
import { SponsorData } from '../types/form-types';
import { formatDateTable } from '../utils/utils';

interface SponsorTableProps {
    sponsors: SponsorData[];
}

export default function SponsorTable({ sponsors }: SponsorTableProps) {
    const router = useRouter();

    return (
        <div className="overflow-x-auto">
            {sponsors.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                    {/* <p>No sponsors found.</p> */}
                </div>
            ) : (
                <table className="min-w-full divide-y divide-slate-700">
                    <thead>
                        <tr className="bg-slate-700/50 text-center text-xs font-medium text-slate-300 uppercase tracking-wider ">
                            <th className="px-6 py-3 text-left">Sponsor</th>
                            <th className="px-6 py-3 ">Location</th>
                            <th className="px-6 py-3 ">Active</th>
                            <th className="px-6 py-3 ">Start Date</th>
                            <th className="px-6 py-3 ">End Date</th>
                            <th className="px-6 py-3 ">Order</th>
                            <th className="px-6 py-3 ">Discount</th>
                            <th className="px-6 py-3 ">Quantity</th>
                            <th className="px-6 py-3 ">Redeem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                        {sponsors.map((sponsor) => (
                            <tr
                                key={sponsor.id as React.Key}
                                className="group whitespace-nowrap text-sm text-center text-slate-300 transition-colors duration-150 hover:bg-slate-700/30 cursor-pointer"
                                onClick={() => router.push(`/${sponsor.id}?location=${encodeURIComponent(sponsor.type as string)}`)}
                            >
                                <td className="px-6 py-4 font-semibold text-left text-white max-w-60 overflow-hidden">{sponsor.sponsor}</td>
                                <td className="px-6 py-4">
                                    <LocationBubble location={sponsor.type} />
                                </td>
                                <td className="px-6 py-4">
                                    {sponsor.active ? (
                                        <span className="inline-flex items-center text-green-400">
                                            <FiCheckCircle className="mr-1" /> Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-red-400">
                                            <FiXCircle className="mr-1" /> Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {sponsor.beginDate ? (
                                        formatDateTable(sponsor.beginDate as string)
                                    ) : (
                                        <div className="w-3 h-px bg-slate-400 mx-auto" />
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {sponsor.endDate ? (
                                        formatDateTable(sponsor.endDate as string)
                                    ) : (
                                        <div className="w-3 h-px bg-slate-400 mx-auto" />
                                    )}
                                </td>
                                <td className="px-6 py-4">{(sponsor.order || sponsor.priority) || <div className="w-3 h-px bg-slate-400 mx-auto" />}</td>
                                <td className="px-6 py-4 font-medium text-[#EECB6C]">
                                    {sponsor.discountAmount ?
                                        `$${sponsor.discountAmount}` :
                                        sponsor.discountPercent ?
                                            `${(sponsor.discountPercent as number) * 100}%` :
                                            <div className="w-3 h-px bg-slate-400 mx-auto" />
                                    }
                                </td>
                                <td className="px-6 py-4">{sponsor.couponsAvailable || 0}</td>
                                <td className="px-6 py-4">{sponsor.purpleCoins || <div className="w-3 h-px bg-slate-400 mx-auto" />}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}